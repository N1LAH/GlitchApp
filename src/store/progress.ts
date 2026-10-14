"use client";

import { create } from "zustand";

type Progress = {
  solved: Record<string, boolean>;
  digits: number[];
  tokens: Record<string, boolean>;
  startedAt?: number;
  finishedAt?: number;
  p1FirstRunCompleted: boolean;
  markSolved: (args: { id: string; digit?: number; token?: string }) => void;
  markP1FirstRunCompleted: () => void;
  reset: () => void;
  startRun: () => void;
  finishRun: () => void;
};

const STORAGE_KEY = "glitch_progress_v1";
/**
 * Mirrors startedAt as a cookie so middleware.ts can redirect fresh visitors
 * to /start at the edge, before any hub HTML is ever sent — localStorage
 * alone can't be read server-side, so a client-only redirect always flashes
 * the hub for a frame first.
 */
const STARTED_COOKIE = "glitch_started";

function setStartedCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${STARTED_COOKIE}=1; path=/; max-age=31536000; SameSite=Lax`;
}

function clearStartedCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${STARTED_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

function load(): Omit<Progress, "markSolved" | "markP1FirstRunCompleted" | "reset" | "startRun" | "finishRun"> {
  if (typeof window === "undefined") {
    return { solved: {}, digits: [], tokens: {}, startedAt: undefined, finishedAt: undefined, p1FirstRunCompleted: false };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { solved: {}, digits: [], tokens: {}, startedAt: undefined, finishedAt: undefined, p1FirstRunCompleted: false };
    const obj = JSON.parse(raw);
    return {
      solved: obj.solved ?? {},
      digits: obj.digits ?? [],
      tokens: obj.tokens ?? {},
      startedAt: obj.startedAt,
      finishedAt: obj.finishedAt,
      p1FirstRunCompleted: obj.p1FirstRunCompleted ?? false,
    };
  } catch {
    return { solved: {}, digits: [], tokens: {}, startedAt: undefined, finishedAt: undefined, p1FirstRunCompleted: false };
  }
}

export const useProgress = create<Progress>((set, get) => ({
  ...load(),
  markSolved: ({ id, digit, token }) => {
    const next = { ...get().solved, [id]: true };
    const digits = [...get().digits];
    if (typeof digit === "number" && !digits.includes(digit)) {
      digits.push(digit);
    }
    const tokens = { ...get().tokens };
    if (token) tokens[token] = true;
    const snapshot = {
      solved: next,
      digits,
      tokens,
      startedAt: get().startedAt,
      finishedAt: get().finishedAt,
      p1FirstRunCompleted: get().p1FirstRunCompleted,
    };
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    }
    set(snapshot);
  },
  markP1FirstRunCompleted: () => {
    const snapshot = {
      ...get(),
      p1FirstRunCompleted: true,
    };
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    }
    set({ p1FirstRunCompleted: true });
  },
  reset: () => {
    const snapshot = { 
      solved: {}, 
      digits: [], 
      tokens: {},
      startedAt: undefined,
      finishedAt: undefined,
      p1FirstRunCompleted: false,
    };
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    }
    clearStartedCookie();
    set(snapshot);
  },
  startRun: () => {
    if (get().startedAt) {
      setStartedCookie();
      return;
    }
    const snapshot = {
      ...get(),
      startedAt: Date.now(),
    };
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    }
    setStartedCookie();
    set({ startedAt: snapshot.startedAt });
  },
  finishRun: () => {
    const snapshot = {
      ...get(),
      finishedAt: Date.now(),
    };
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    }
    set({ finishedAt: snapshot.finishedAt });
  },
}));
