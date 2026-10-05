#!/usr/bin/env node
/**
 * Pre-publish link gate. Checks that every lesson video is still public and embeddable (YouTube
 * oEmbed returns 200) and that every external URL in the frontmatter still resolves.
 *
 * Usage:
 *   node scripts/check-links.js            # videos + links, exit 1 on any failure
 *   node scripts/check-links.js --videos   # videos only
 *   node scripts/check-links.js --durations [--write]
 *        print each primary video's length and year; --write stores video.minutes, video.year
 *        and video.published
 *   Any other argument is a lesson path or folder that limits the run (e.g. one lesson file).
 *
 * Sites that block bots (403/429 from a HEAD and a GET) are reported as warnings, not failures.
 */
const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const ROOT = path.resolve(__dirname, "..");
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36";

function lessons(targets) {
  const out = [];
  const walk = (d) => {
    for (const f of fs.readdirSync(d)) {
      const p = path.join(d, f);
      if (fs.statSync(p).isDirectory()) walk(p);
      else if (p.endsWith(".mdx")) out.push(p);
    }
  };
  for (const t of targets.length ? targets : ["content"]) {
    const abs = path.resolve(ROOT, t);
    if (fs.statSync(abs).isDirectory()) walk(abs);
    else out.push(abs);
  }
  return out.sort();
}

function youtubeId(url) {
  const m = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/.exec(url);
  return m ? m[1] : null;
}

async function pool(items, size, fn) {
  const results = [];
  let i = 0;
  await Promise.all(
    Array.from({ length: size }, async () => {
      while (i < items.length) {
        const idx = i++;
        results[idx] = await fn(items[idx]);
      }
    })
  );
  return results;
}

/** HTTP status, retried twice (with a pause) on network errors such as a flaky DNS lookup. */
async function fetchStatus(url, method) {
  let s;
  for (let attempt = 0; attempt < 3; attempt++) {
    s = await fetchOnce(url, method);
    if (typeof s === "number") return s;
    await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
  }
  return s;
}

async function fetchOnce(url, method) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 20000);
  try {
    const r = await fetch(url, { method, redirect: "follow", signal: ctrl.signal, headers: { "user-agent": UA } });
    return r.status;
  } catch (e) {
    return `ERR ${e.name === "AbortError" ? "timeout" : e.cause?.code || e.message}`;
  } finally {
    clearTimeout(t);
  }
}

/** The video is public and embeddable, and (when the lesson names one) on the channel it claims. */
async function checkVideo(id, channels) {
  const url = `https://www.youtube.com/oembed?format=json&url=https://www.youtube.com/watch?v=${id}`;
  for (let attempt = 0; attempt < 3; attempt++) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 20000);
    try {
      const r = await fetch(url, { signal: ctrl.signal, headers: { "user-agent": UA } });
      if (r.status !== 200) return `oEmbed ${r.status}`;
      const author = String((await r.json()).author_name ?? "").trim();
      // Letters and digits only, so "Theo - t3.gg" matches "Theo - t3․gg" and a credit in
      // brackets ("freeCodeCamp.org (Lance Martin)") still names the channel.
      const bare = (x) => x.toLowerCase().replace(/[^a-z0-9]/g, "");
      const wrong = [...channels].filter((c) => !bare(c).startsWith(bare(author)) || !bare(author));
      return wrong.length ? `channel is "${author}", lesson says "${wrong.join('", "')}"` : null;
    } catch {
      /* retry */
    } finally {
      clearTimeout(t);
    }
    await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
  }
  return "oEmbed unreachable";
}

async function checkUrl(url) {
  let s = await fetchStatus(url, "HEAD");
  if (s !== 200 && !(typeof s === "number" && s < 400)) s = await fetchStatus(url, "GET");
  if (typeof s === "number" && s < 400) return { ok: true };
  if (s === 403 || s === 429 || s === 999) return { ok: true, warn: `HTTP ${s} (bot block?)` };
  return { ok: false, why: typeof s === "number" ? `HTTP ${s}` : s };
}

/** Length in seconds and publication year, read from the watch page. */
async function videoInfo(id) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 20000);
    try {
      const r = await fetch(`https://www.youtube.com/watch?v=${id}&hl=en`, { signal: ctrl.signal, headers: { "user-agent": UA, "accept-language": "en" } });
      const html = await r.text();
      const secs = /"lengthSeconds":"(\d+)"/.exec(html);
      const date = /"(?:publishDate|uploadDate)":"(\d{4})-(\d{2})-(\d{2})/.exec(html) || /itemprop="(?:datePublished|uploadDate)" content="(\d{4})-(\d{2})-(\d{2})/.exec(html);
      if (secs) return { secs: Number(secs[1]), year: date ? Number(date[1]) : null, published: date ? `${date[1]}-${date[2]}-${date[3]}` : null };
    } catch {
      /* retry */
    } finally {
      clearTimeout(t);
    }
    await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
  }
  return { secs: null, year: null, published: null };
}

/** Set (or add after videoId) a `  key: value` line inside the video block. */
function setVideoField(raw, key, value) {
  const line = new RegExp(`\\n  ${key}: [^\\n]*\\n`);
  return line.test(raw)
    ? raw.replace(line, `\n  ${key}: ${value}\n`)
    : raw.replace(/(\n  videoId: [^\n]+\n)/, `$1  ${key}: ${value}\n`);
}

async function main() {
  const args = process.argv.slice(2);
  const files = lessons(args.filter((a) => !a.startsWith("--"))).map((file) => ({ file, rel: path.relative(ROOT, file).replace(/\\/g, "/"), raw: fs.readFileSync(file, "utf8") }));
  for (const f of files) f.fm = matter(f.raw).data;

  if (args.includes("--durations")) {
    const write = args.includes("--write");
    await pool(files, 6, async (f) => {
      const id = f.fm.video?.videoId;
      const { secs, year, published } = id ? await videoInfo(id) : { secs: null, year: null, published: null };
      const min = secs ? Math.max(1, Math.round(secs / 60)) : null;
      console.log(`${String(min ?? "?").padStart(4)} min  ${year ?? "????"}  ${f.rel}`);
      const raw = f.raw.replace(/\r\n/g, "\n");
      let next = raw;
      if (write && min) {
        next = setVideoField(next, "minutes", min);
        if (year) next = setVideoField(next, "year", year);
        if (published) next = setVideoField(next, "published", `"${published}"`);
      }
      if (write && next !== raw) fs.writeFileSync(f.file, next);
    });
    return;
  }

  const videos = new Map(); // id -> [where]
  const channels = new Map(); // id -> Set of channel names the lessons claim
  const urls = new Map();
  const add = (map, key, where) => map.set(key, [...(map.get(key) || []), where]);
  for (const f of files) {
    const claim = (id, channel) => channel && channels.set(id, new Set([...(channels.get(id) || []), channel]));
    if (f.fm.video?.videoId) {
      add(videos, f.fm.video.videoId, `${f.rel} (primary)`);
      claim(f.fm.video.videoId, f.fm.video.channel);
    }
    const links = [...(f.fm.readAfter || []), ...(f.fm.backupResources || [])];
    for (const l of links) {
      if (!l?.url) continue;
      const id = youtubeId(l.url);
      if (id) add(videos, id, f.rel);
      else add(urls, l.url, f.rel);
    }
  }

  const failures = [];
  const warnings = [];
  await pool([...videos.keys()], 5, async (id) => {
    const why = await checkVideo(id, channels.get(id) || new Set());
    if (why) failures.push(`VIDEO ${id} ${why} — ${videos.get(id).join(", ")}`);
  });
  if (!args.includes("--videos")) {
    await pool([...urls.keys()], 5, async (url) => {
      const r = await checkUrl(url);
      if (!r.ok) failures.push(`LINK ${url} ${r.why} — ${urls.get(url).join(", ")}`);
      else if (r.warn) warnings.push(`link ${url} ${r.warn}`);
    });
  }
  for (const w of warnings) console.log(`warn  ${w}`);
  for (const f of failures) console.log(`FAIL  ${f}`);
  console.log(`\n${videos.size} videos · ${args.includes("--videos") ? 0 : urls.size} links · ${failures.length} failures · ${warnings.length} warnings`);
  process.exit(failures.length ? 1 : 0);
}

main();
