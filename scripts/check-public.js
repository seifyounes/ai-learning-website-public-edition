#!/usr/bin/env node
/**
 * Public-edition content gate. Every lesson must:
 *  - parse (gray-matter / YAML),
 *  - carry the public schema (applyIt, toolkit, task, recap, selfCheck, video.videoId),
 *  - drop the private fields (mentor, claudeOs, applyTo),
 *  - contain no unfinished markers, internal notes or personal paths, and (when the gitignored
 *    scripts/private-terms.local.json is present) none of the author's private identifiers.
 * Contextual words only warn. Exit 1 on any error.
 *
 * Usage: node scripts/check-public.js [--json out.json] [paths…]
 */
const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const ROOT = path.resolve(__dirname, "..");

// Generic bans: things that should never ship in a public lesson.
const BANS = [
  [/[A-Z]:\\(Claude|Users)\b/, "personal path"],
  [/\bthe owner('s)?\b/i, "owner framing"],
  [/oEmbed|re-gated|deep-vet/i, "internal curation note"],
  [/\b(?:TODO|TBD|FIXME)[:(]/, "unfinished marker"],
  [/\bP[1-8]\b/, "internal pillar code (use the pillar or lesson title)"],
  [/\bowns (?:that|the|this) (?:doctrine|topic|idea|second|first)\b|\bthis lesson owns\b|\bowning lesson\b/i, "internal topic-ownership phrasing (say \"is covered in → slug\")"],
  [/\b(?:two|three|four|five) (?:of your )?(?:\w+ )?testers\b|your (?:two|three|four|five) testers/i, "a specific tester count from a private project"],
  [/\bultimate guide\b|best explanation on the internet|\bbest\b[^.\n]{0,40}\banywhere\b|\bmillions of (?:engineers|people|learners)\b/i, "unverifiable superlative"],
];

// Owner-specific identifiers live in a gitignored file so the public repo never names them.
const LOCAL_TERMS = path.join(__dirname, "private-terms.local.json");
let hasLocalTerms = false;
if (fs.existsSync(LOCAL_TERMS)) {
  hasLocalTerms = true;
  for (const [pattern, flags, why] of JSON.parse(fs.readFileSync(LOCAL_TERMS, "utf8")).bans) {
    BANS.push([new RegExp(pattern, flags), why]);
  }
}

const WARNS = [
  [/RevenueCat/, "RevenueCat (check it's generic)"],
  [/Codemagic/, "Codemagic (check it's generic)"],
  [/\btesters?\b/i, "testers (check it's generic)"],
  [/MEMORY.md/, "MEMORY.md (pair it with a generic name; it reads as one person's setup)"],
  [/habit tracker/i, "habit tracker (check it's not the private app)"],
  [/\bDart\b/, "Dart (check it's generic, not a private-project anecdote)"],
  [/Edge Functions?\b/, "Edge Function (check it's generic)"],
  [/\bon a restore\b|\brestore purchases?\b/i, "restore (check it's generic)"],
];

// Pillars whose learners use a coding agent by definition; everywhere else the setup block must
// work for someone who doesn't code.
const CODING_PILLARS = new Set(["claude-code", "applied-ai-engineering", "shipping-apps"]);
const CODING_AGENT_TERMS = /CLAUDE\.md|AGENTS\.md|\bhooks?\b|subagents?|Claude Code|Codex|Cursor|Copilot|settings\.json|slash command|\/[a-z]+-?[a-z]* command|MCP server/i;

// Every lesson slug; a slug in prose must be written as a pointer (`→ slug`) so it renders as a
// link. Anything else shows the reader a raw, unclickable slug.
const ALL_SLUGS = new Set();
(function collectSlugs(d) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) collectSlugs(p);
    else if (p.endsWith(".mdx")) ALL_SLUGS.add(f.replace(/\.mdx$/, ""));
  }
})(path.join(ROOT, "content"));

/** Raw slugs in prose: a hyphenated lesson slug that isn't a `→ slug` pointer, a URL or code. */
function rawSlugs(text) {
  const found = [];
  const prose = text.replace(/```[\s\S]*?```/g, "").replace(/`[^`\n]*`/g, "").replace(/\]\([^)]*\)/g, "](…)").replace(/https?:\/\/\S+/g, "");
  const re = /(?<![\w/-])([a-z0-9]+(?:-[a-z0-9]+)+)(?![\w/-])/g;
  let m;
  while ((m = re.exec(prose))) {
    if (!ALL_SLUGS.has(m[1])) continue;
    const before = prose.slice(Math.max(0, m.index - 16), m.index);
    if (/→\s*(?:covered in\s+)?(?:\*\*)?$/.test(before)) continue;
    found.push(m[1]);
  }
  return found;
}

/** A guessable MCQ: the right option is clearly longer than the others. */
function guessableMcq(q) {
  if (!Array.isArray(q.options) || typeof q.answer !== "number") return "malformed mcq";
  const lens = q.options.map((o) => String(o).length);
  const others = lens.filter((_, i) => i !== q.answer).sort((a, b) => a - b);
  const median = others[Math.floor(others.length / 2)];
  if (lens[q.answer] > median * 1.25) return `answer is ${lens[q.answer]} chars vs median ${median} — the longest option gives it away`;
  return null;
}

const REQUIRED = ["title", "section", "pillar", "order", "level", "estMinutes", "applyIt", "toolkit", "task"];
const FORBIDDEN = ["mentor", "claudeOs", "applyTo"];

function lessonFiles(dirs) {
  const out = [];
  const walk = (d) => {
    for (const f of fs.readdirSync(d)) {
      const p = path.join(d, f);
      if (fs.statSync(p).isDirectory()) walk(p);
      else if (p.endsWith(".mdx")) out.push(p);
    }
  };
  for (const d of dirs) {
    const abs = path.resolve(ROOT, d);
    if (fs.statSync(abs).isDirectory()) walk(abs);
    else out.push(abs);
  }
  return out.sort();
}

const args = process.argv.slice(2);
let jsonOut = null;
const targets = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--json") jsonOut = args[++i];
  else targets.push(args[i]);
}

const files = lessonFiles(targets.length ? targets : ["content"]);
const errors = [];
const warnings = [];

for (const file of files) {
  const rel = path.relative(ROOT, file).replace(/\\/g, "/");
  const raw = fs.readFileSync(file, "utf8");
  let parsed;
  try {
    parsed = matter(raw);
  } catch (e) {
    errors.push({ file: rel, rule: "yaml", detail: e.message.split("\n")[0] });
    continue;
  }
  const fm = parsed.data;
  for (const k of REQUIRED) {
    if (fm[k] === undefined || fm[k] === null || fm[k] === "") errors.push({ file: rel, rule: "schema", detail: `missing ${k}` });
  }
  for (const k of FORBIDDEN) {
    if (k in fm) errors.push({ file: rel, rule: "schema", detail: `private field ${k}` });
  }
  if (!fm.video || !fm.video.videoId) errors.push({ file: rel, rule: "schema", detail: "missing video.videoId" });
  if (!Array.isArray(fm.recap) || fm.recap.length < 3) errors.push({ file: rel, rule: "schema", detail: "recap needs ≥3 steps" });
  if (!Array.isArray(fm.selfCheck) || fm.selfCheck.length < 2) errors.push({ file: rel, rule: "schema", detail: "selfCheck needs ≥2" });
  if (fm.video && !(fm.video.minutes > 0)) errors.push({ file: rel, rule: "schema", detail: "missing video.minutes (run check-links.js --durations --write)" });
  if (!(fm.taskMinutes >= 5 && fm.taskMinutes <= 180)) errors.push({ file: rel, rule: "schema", detail: "taskMinutes must be a realistic number of minutes for the task (5–180)" });
  if (typeof fm.summary !== "string" || fm.summary.length < 60 || fm.summary.length > 170) {
    errors.push({ file: rel, rule: "schema", detail: `summary must be a 60–170 character plain sentence (has ${fm.summary?.length ?? 0})` });
  }
  if (fm.video?.start !== undefined && !(Number.isInteger(fm.video.start) && fm.video.start >= 0)) {
    errors.push({ file: rel, rule: "schema", detail: "video.start must be whole seconds" });
  }
  if (fm.video?.watchMinutes !== undefined && !(fm.video.watchMinutes > 0 && fm.video.watchMinutes <= (fm.video.minutes ?? Infinity))) {
    errors.push({ file: rel, rule: "schema", detail: "video.watchMinutes must be positive and no longer than the video" });
  }
  if (fm.video?.minutes > 90 && !fm.video?.watchMinutes) {
    errors.push({ file: rel, rule: "schema", detail: `the video runs ${fm.video.minutes} min: set video.start + video.watchMinutes to the chapter this lesson needs` });
  }
  // Non-coding lessons lead the setup block with tools anyone has; coding-agent advice sits under
  // an explicit "If you use a coding agent" label so non-coders can skip it.
  if (!CODING_PILLARS.has(fm.pillar) && typeof fm.toolkit === "string") {
    const label = fm.toolkit.search(/If you use a coding agent/i);
    const before = label < 0 ? fm.toolkit : fm.toolkit.slice(0, label);
    if (CODING_AGENT_TERMS.test(before)) {
      errors.push({ file: rel, rule: "audience", detail: `toolkit: coding-agent advice (${before.match(CODING_AGENT_TERMS)[0]}) before an "If you use a coding agent" label` });
    }
  }
  // The review date means something only with a note on what that review changed or checked.
  if (typeof fm.changeNote !== "string" || fm.changeNote.length < 30 || fm.changeNote.length > 200) {
    errors.push({ file: rel, rule: "schema", detail: `changeNote must say in 30–200 characters what the last review changed or checked (has ${fm.changeNote?.length ?? 0})` });
  }
  // Long lessons offer a first sitting: what to do now and what to come back to. Same sum as
  // totalMinutes() in src/lib/content.ts.
  {
    const words = [parsed.content, fm.applyIt, fm.toolkit].filter(Boolean).join(" ")
      .replace(/```[\s\S]*?```/g, " ").split(/\s+/).filter(Boolean).length;
    const video = fm.video?.watchMinutes ?? fm.video?.minutes;
    const parts = (video ?? 0) + Math.max(1, Math.round(words / 180)) + (fm.taskMinutes ?? 0);
    const total = video && fm.taskMinutes ? parts : fm.estMinutes ?? parts;
    if (total > 90 && (typeof fm.shortPath !== "string" || fm.shortPath.length < 60 || fm.shortPath.length > 260)) {
      errors.push({ file: rel, rule: "schema", detail: `the lesson takes ${total} min: add a shortPath (60–260 characters) naming a first sitting of about 40 min and what to come back to (has ${fm.shortPath?.length ?? 0})` });
    }
  }
  // A "why" that sends the learner to part of the video must set that part, so the header time
  // and the player's start point match what the lesson asks for.
  if (fm.video?.why && !fm.video.watchMinutes && /\bwatch (?:the first|only|chapters?|from|up to|minutes?)\b|\b\d{1,2}:\d{2}(?::\d{2})?\s*(?:–|-|to)\s*\d{1,2}:\d{2}/i.test(fm.video.why)) {
    errors.push({ file: rel, rule: "schema", detail: "video.why points at part of the video: set video.start and video.watchMinutes to match" });
  }
  // Outside the Claude Code pillar, rules files are named vendor-neutrally: AGENTS.md first.
  if (fm.pillar !== "claude-code") {
    raw.replace(/\r\n/g, "\n").split("\n").forEach((line, i) => {
      if (/CLAUDE\.md/.test(line) && !/AGENTS\.md|rules file/i.test(line)) {
        errors.push({ file: rel, line: i + 1, rule: "neutral", detail: `CLAUDE.md without AGENTS.md / "rules file" on the same line: ${line.trim().slice(0, 90)}` });
      }
    });
  }
  // Diagrams must fit a 320px phone: ```diagram blocks at most 28 columns (they never wrap), plain
  // text blocks at most 40 (anything wider is code and gets its real language, or a diagram).
  for (const m of parsed.content.replace(/\r\n/g, "\n").matchAll(/```([a-z]*)\n([\s\S]*?)```/g)) {
    const width = Math.max(...m[2].split("\n").map((l) => [...l].length));
    if (m[1] === "diagram" && width > 28) {
      errors.push({ file: rel, rule: "mobile", detail: `diagram is ${width} columns wide; redraw it at 28 or fewer (stack parts vertically)` });
    }
    if (["", "text", "txt", "plain"].includes(m[1]) && width > 40) {
      errors.push({ file: rel, rule: "mobile", detail: `untyped code block is ${width} columns wide: make it a \`\`\`diagram of 34 columns or fewer, wrap the lines, or tag its real language` });
    }
  }
  // The "why" is a short argument for the pick; timestamps and errata go in video.notes.
  if (fm.video?.why && fm.video.why.split(/\s+/).length > 90) {
    errors.push({ file: rel, rule: "length", detail: `video.why is ${fm.video.why.split(/\s+/).length} words; keep it under 90 and move watch ranges and errata into video.notes` });
  }
  if (fm.video?.notes !== undefined && !(Array.isArray(fm.video.notes) && fm.video.notes.every((n) => typeof n === "string" && n.length <= 220))) {
    errors.push({ file: rel, rule: "schema", detail: "video.notes must be a list of short strings (≤220 characters each)" });
  }
  // One Success line per path: a second one right after the first is a leftover.
  {
    const lines = raw.replace(/\r\n/g, "\n").split("\n");
    let last = -99;
    lines.forEach((line, i) => {
      if (/^\s*Success:/.test(line)) {
        if (i - last <= 3) errors.push({ file: rel, line: i + 1, rule: "dup", detail: "two Success: lines in a row" });
        last = i;
      }
    });
  }
  if (fm.prerequisites !== undefined) {
    if (!Array.isArray(fm.prerequisites)) errors.push({ file: rel, rule: "schema", detail: "prerequisites must be a list of lesson slugs" });
    else for (const s of fm.prerequisites) if (!ALL_SLUGS.has(s)) errors.push({ file: rel, rule: "schema", detail: `prerequisite '${s}' is not a lesson slug` });
  }
  (fm.mcq || []).forEach((q, i) => {
    const why = guessableMcq(q);
    if (why) errors.push({ file: rel, rule: "mcq", detail: `Q${i + 1}: ${why}` });
  });

  const proseFields = [
    ["body", parsed.content],
    ["applyIt", fm.applyIt],
    ["toolkit", fm.toolkit],
    ["task", fm.task],
    ["video.why", fm.video?.why],
    ["shortPath", fm.shortPath],
    ...(fm.recap || []).map((r, i) => [`recap ${i + 1}`, `${r.title} ${r.text}`]),
    ...(fm.selfCheck || []).map((s, i) => [`selfCheck ${i + 1}`, `${s.q} ${s.a}`]),
    ...(fm.mcq || []).map((q, i) => [`mcq ${i + 1}`, `${q.q} ${(q.options || []).join(" ")} ${q.explain || ""}`]),
  ];
  for (const [field, text] of proseFields) {
    if (typeof text !== "string") continue;
    for (const slug of rawSlugs(text)) errors.push({ file: rel, rule: "slug", detail: `${field}: raw slug '${slug}' (write it as → ${slug})` });
  }

  // "→ the some-slug pillar" shows a raw slug; name the pillar and link it instead.
  for (const m of raw.matchAll(/→\s*the\s+\*{0,2}([a-z]+(?:-[a-z]+)+)\*{0,2}\s+(?:pillar|track)\b/g)) {
    errors.push({ file: rel, rule: "slug", detail: `pillar pointer by slug '${m[1]}' (link the pillar by its name)` });
  }

  const textLines = raw.replace(/\r\n/g, "\n").split("\n");
  textLines.forEach((line, i) => {
    for (const [re, why] of BANS) {
      // A creator's own video or page title is quoted as-is; only our own claims are policed.
      if (why === "unverifiable superlative" && /^\s*-?\s*(?:label|title):/.test(line)) continue;
      if (re.test(line)) errors.push({ file: rel, line: i + 1, rule: "ban", detail: `${why}: ${line.trim().slice(0, 110)}` });
    }
    for (const [re, why] of WARNS) {
      if (re.test(line)) warnings.push({ file: rel, line: i + 1, rule: "warn", detail: `${why}: ${line.trim().slice(0, 110)}` });
    }
  });
}

for (const e of errors) console.log(`ERROR ${e.file}${e.line ? ":" + e.line : ""} [${e.rule}] ${e.detail}`);
if (process.env.SHOW_WARNINGS) {
  for (const w of warnings) console.log(`warn  ${w.file}:${w.line} ${w.detail}`);
}
if (!hasLocalTerms) console.log("note: scripts/private-terms.local.json not found; ran generic checks only");
console.log(`\n${files.length} lessons · ${errors.length} errors · ${warnings.length} warnings`);
if (jsonOut) fs.writeFileSync(jsonOut, JSON.stringify({ errors, warnings }, null, 2));
process.exit(errors.length ? 1 : 0);
