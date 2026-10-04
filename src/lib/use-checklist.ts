"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Generic persisted checklist — the useProgress pattern for arbitrary
 * checkbox sets (e.g. the Get-Hired career checklist at "ai-learn:career:v1").
 */
export function useChecklist(storageKey: string) {
  const [map, setMap] = useState<Record<string, boolean>>({});
  const [hydrated, setHydrated] = useState(false);

  const read = useCallback((): Record<string, boolean> => {
    if (typeof window === "undefined") return {};
    try {
      const raw = window.localStorage.getItem(storageKey);
      return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
    } catch {
      return {};
    }
  }, [storageKey]);

  useEffect(() => {
    setMap(read());
    setHydrated(true);

    const sync = () => setMap(read());
    const event = `${storageKey}-change`;
    window.addEventListener(event, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(event, sync);
      window.removeEventListener("storage", sync);
    };
  }, [read, storageKey]);

  const isChecked = useCallback((id: string) => Boolean(map[id]), [map]);

  const toggle = useCallback(
    (id: string) => {
      const next = read();
      if (next[id]) {
        delete next[id];
      } else {
        next[id] = true;
      }
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(next));
        window.dispatchEvent(new Event(`${storageKey}-change`));
      } catch {
        /* ignore quota / private-mode errors */
      }
      setMap(next);
    },
    [read, storageKey],
  );

  const checkedCount = Object.values(map).filter(Boolean).length;

  return { map, hydrated, isChecked, toggle, checkedCount };
}
