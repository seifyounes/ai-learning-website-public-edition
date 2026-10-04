"use client";

import { useCallback, useEffect, useState } from "react";
import type { ActivityEvent } from "./gamification";

const PROGRESS_KEY = "ai-learn:progress:v1";
const ACTIVITY_KEY = "ai-learn:activity:v1";
const MAX_EVENTS = 2000;

function read(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(PROGRESS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
  } catch {
    return {};
  }
}

function write(map: Record<string, boolean>) {
  try {
    window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(map));
    // Notify other hook instances in the same tab.
    window.dispatchEvent(new Event("ai-learn:progress-change"));
  } catch {
    /* ignore quota / private-mode errors */
  }
}

function readActivity(): ActivityEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ACTIVITY_KEY);
    return raw ? (JSON.parse(raw) as ActivityEvent[]) : [];
  } catch {
    return [];
  }
}

function writeActivity(events: ActivityEvent[]) {
  try {
    window.localStorage.setItem(ACTIVITY_KEY, JSON.stringify(events.slice(-MAX_EVENTS)));
    window.dispatchEvent(new Event("ai-learn:progress-change"));
  } catch {
    /* ignore quota / private-mode errors */
  }
}

/**
 * Tracks lesson completion in localStorage. `hydrated` lets callers avoid a
 * flash of wrong state during SSR hydration. Completions also append to an
 * activity log (`ai-learn:activity:v1`) that powers streaks — the progress
 * map itself stays a plain Record<key, boolean>.
 */
export function useProgress() {
  const [map, setMap] = useState<Record<string, boolean>>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setMap(read());
    setHydrated(true);

    const sync = () => setMap(read());
    window.addEventListener("ai-learn:progress-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("ai-learn:progress-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const isComplete = useCallback((key: string) => Boolean(map[key]), [map]);

  const toggle = useCallback((key: string) => {
    const next = read();
    const events = readActivity();
    if (next[key]) {
      delete next[key];
      // Un-completing removes the latest event for the key so accidental
      // double-toggles don't inflate streaks.
      const last = events.map((e) => e.key).lastIndexOf(key);
      if (last !== -1) events.splice(last, 1);
    } else {
      next[key] = true;
      events.push({ key, ts: Date.now() });
    }
    writeActivity(events);
    write(next);
    setMap(next);
  }, []);

  const completedCount = Object.values(map).filter(Boolean).length;

  return { map, hydrated, isComplete, toggle, completedCount };
}

/** The completion activity log (read-only view) — powers streaks & badges. */
export function useActivity() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setEvents(readActivity());
    setHydrated(true);

    const sync = () => setEvents(readActivity());
    window.addEventListener("ai-learn:progress-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("ai-learn:progress-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return { events, hydrated };
}
