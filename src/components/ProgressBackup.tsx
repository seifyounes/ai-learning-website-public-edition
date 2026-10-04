"use client";

import { useEffect, useRef, useState } from "react";

const PREFIX = "ai-learn:";
// What was saved before the last import, so one import can be undone. Outside PREFIX so it is
// never exported or imported itself.
const UNDO_KEY = "ai-learn-undo:before-import";
const PROGRESS_KEY = "ai-learn:progress:v1";

/** Lessons marked complete in a stored progress value. */
function completedCount(raw: string | null | undefined): number {
  try {
    return Object.values(JSON.parse(raw ?? "{}") as Record<string, unknown>).filter(Boolean).length;
  } catch {
    return 0;
  }
}

/** Every `ai-learn:*` item in this browser. */
function savedItems(): Record<string, string> {
  const data: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(PREFIX)) data[k] = localStorage.getItem(k) ?? "";
  }
  return data;
}

/**
 * Everything this site remembers lives in localStorage under `ai-learn:*`. This box lets a
 * learner move it between browsers or devices (export → file → import) and wipe it. Nothing is
 * ever sent anywhere.
 */
export default function ProgressBackup() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [canUndo, setCanUndo] = useState(false);

  useEffect(() => {
    try {
      setCanUndo(localStorage.getItem(UNDO_KEY) !== null);
    } catch {
      // Storage blocked: nothing to undo.
    }
  }, []);

  const exportData = () => {
    try {
      const data = savedItems();
      const blob = new Blob([JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), data }, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ai-learning-progress-${new Date().toISOString().slice(0, 10)}.json`;
      // Attached to the page and revoked a moment later: some Safari and Firefox versions cancel a
      // download whose URL is revoked straight after a click on a detached link.
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setStatus(`Exported ${Object.keys(data).length} saved items.`);
    } catch {
      setStatus("Export failed: this browser blocked access to local storage.");
    }
  };

  const importData = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text()) as {
        exportedAt?: string;
        data?: Record<string, string>;
      };
      const entries = Object.entries(parsed.data ?? {}).filter(
        ([k, v]) => k.startsWith(PREFIX) && typeof v === "string",
      );
      if (!entries.length) {
        setStatus("That file has no AI Learning progress in it.");
        return;
      }
      const current = savedItems();
      const fileDone = completedCount(parsed.data?.[PROGRESS_KEY]);
      const nowDone = completedCount(current[PROGRESS_KEY]);
      const when = parsed.exportedAt ? new Date(parsed.exportedAt) : null;
      const dated =
        when && !Number.isNaN(when.getTime())
          ? ` (exported ${when.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })})`
          : "";
      const ok = window.confirm(
        `This file has ${fileDone} completed lesson${fileDone === 1 ? "" : "s"}${dated}. ` +
          `This browser has ${nowDone}. Everything in the file replaces what this browser has ` +
          `saved for the same items. You can undo it once afterwards. Import?`,
      );
      if (!ok) {
        setStatus("Import cancelled. Nothing changed.");
        return;
      }
      localStorage.setItem(UNDO_KEY, JSON.stringify(current));
      for (const [k, v] of entries) localStorage.setItem(k, v);
      window.dispatchEvent(new Event("ai-learn:progress-change"));
      setStatus(`Imported ${entries.length} saved items. Reloading…`);
      setTimeout(() => window.location.reload(), 600);
    } catch {
      setStatus("Couldn't read that file. Choose a progress file exported from this site.");
    }
  };

  const undoImport = () => {
    try {
      const before = JSON.parse(localStorage.getItem(UNDO_KEY) ?? "null") as Record<string, string> | null;
      if (!before) return;
      Object.keys(savedItems()).forEach((k) => localStorage.removeItem(k));
      for (const [k, v] of Object.entries(before)) localStorage.setItem(k, v);
      localStorage.removeItem(UNDO_KEY);
      window.dispatchEvent(new Event("ai-learn:progress-change"));
      setStatus("Restored what was saved before the import. Reloading…");
      setTimeout(() => window.location.reload(), 600);
    } catch {
      setStatus("Couldn't undo: this browser blocked access to local storage.");
    }
  };

  const reset = () => {
    if (!window.confirm("Erase all progress, notes, quiz scores and checklist items in this browser? This can't be undone.")) {
      return;
    }
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(PREFIX)) keys.push(k);
    }
    keys.forEach((k) => localStorage.removeItem(k));
    localStorage.removeItem(UNDO_KEY);
    window.dispatchEvent(new Event("ai-learn:progress-change"));
    setStatus("Everything is erased. Reloading…");
    setTimeout(() => window.location.reload(), 600);
  };

  return (
    <section className="pencil-box px-4 pb-4 pt-3" aria-labelledby="backup-heading">
      <h2 id="backup-heading" className="field-label">
        Your data
      </h2>
      <p className="mt-2 text-body-small text-pencil">
        Progress, notes and quiz scores are saved only in this browser. Export them to keep a
        backup or move to another device.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={exportData} className="btn-print btn-sm">
          Export progress
        </button>
        <button type="button" onClick={() => fileRef.current?.click()} className="btn-print btn-sm">
          Import progress
        </button>
        {canUndo && (
          <button type="button" onClick={undoImport} className="btn-print btn-sm">
            Undo last import
          </button>
        )}
        <button type="button" onClick={reset} className="btn-print btn-sm border-red-pen text-red-pen">
          Erase all
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="sr-only"
          tabIndex={-1}
          aria-label="Choose a progress file to import"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void importData(f);
            e.target.value = "";
          }}
        />
      </div>
      {status && (
        <p className="mt-2 text-[14px] text-graphite" role="status">
          {status}
        </p>
      )}
    </section>
  );
}
