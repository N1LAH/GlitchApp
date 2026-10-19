"use client";

import { create } from "zustand";
import { CLUES } from "@/lib/clues";

type Snapshot = {
  solved: Record<string, boolean>;
  tokens: Record<string, boolean>;
  /** When the team entered the lab (gates the /start redirect). */
  startedAt?: number;
  /** When the team opened its first puzzle — the clock on the end screen. */
  timerStartedAt?: number;
  finishedAt?: number;
  p1FirstRunCompleted: boolean;
};

type Progress = Snapshot & {
  markSolved: (args: { id: string; token?: string }) => void;
  markP1FirstRunCompleted: () => void;
  reset: () => void;
  startRun: () => void;
  startTimer: () => void;
  finishRun: () => void;
};

const STORAGE_KEY = "glitch_progress_v1";
/** Fact or Fiction keeps its own in-progress sorting under this key. */
export const P4_STORAGE_KEY = "glitch_p4_v2";
/**
 * A saved game older than this is treated as abandoned and discarded, so a
 * team on a shared device never inherits a previous group's progress or clock.
 */
const SESSION_MAX_AGE_MS = 12 * 60 * 60 * 1000;
/**
 * Mirrors startedAt as a cookie so middleware.ts can redirect fresh visitors
 * to /start at the edge, before any hub HTML is ever sent — localStorage
 * alone can't be read server-side, so a client-only redirect always flashes
 * the hub for a frame first.
 */
const STARTED_COOKIE = "glitch_started";

function setStartedCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${STARTED_COOKIE}=1; path=/; max-age=${SESSION_MAX_AGE_MS / 1000}; SameSite=Lax`;
}

function clearStartedCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${STARTED_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

function fresh(): Snapshot {
  return {
    solved: {},
    tokens: {},
    startedAt: undefined,
    timerStartedAt: undefined,
    finishedAt: undefined,
    p1FirstRunCompleted: false,
  };
}

function persist(snapshot: Snapshot) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
}

function load(): Snapshot {
  if (typeof window === "undefined") return fresh();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fresh();
    const obj = JSON.parse(raw);
    if (typeof obj.startedAt === "number" && Date.now() - obj.startedAt > SESSION_MAX_AGE_MS) {
      localStorage.removeItem(P4_STORAGE_KEY);
      clearStartedCookie();
      return fresh();
    }
    return {
      solved: obj.solved ?? {},
      tokens: obj.tokens ?? {},
      startedAt: obj.startedAt,
      timerStartedAt: obj.timerStartedAt,
      finishedAt: obj.finishedAt,
      p1FirstRunCompleted: obj.p1FirstRunCompleted ?? false,
    };
  } catch {
    return fresh();
  }
}

export const useProgress = create<Progress>((set, get) => {
  const snapshotOf = (): Snapshot => {
    const { solved, tokens, startedAt, timerStartedAt, finishedAt, p1FirstRunCompleted } = get();
    return { solved, tokens, startedAt, timerStartedAt, finishedAt, p1FirstRunCompleted };
  };
  const update = (patch: Partial<Snapshot>) => {
    const snapshot = { ...snapshotOf(), ...patch };
    persist(snapshot);
    set(patch);
  };

  return {
    ...load(),
    markSolved: ({ id, token }) => {
      const tokens = { ...get().tokens };
      if (token) tokens[token] = true;
      update({ solved: { ...get().solved, [id]: true }, tokens });
    },
    markP1FirstRunCompleted: () => update({ p1FirstRunCompleted: true }),
    reset: () => {
      const snapshot = fresh();
      persist(snapshot);
      if (typeof window !== "undefined") localStorage.removeItem(P4_STORAGE_KEY);
      clearStartedCookie();
      set(snapshot);
    },
    startRun: () => {
      setStartedCookie();
      if (!get().startedAt) update({ startedAt: Date.now() });
    },
    startTimer: () => {
      if (!get().timerStartedAt) update({ timerStartedAt: Date.now() });
    },
    finishRun: () => update({ finishedAt: Date.now() }),
  };
});

/** Digits the team has earned so far, in door-code order. */
export function earnedClues(solved: Record<string, boolean>) {
  return CLUES.filter((c) => solved[c.puzzleId]);
}
