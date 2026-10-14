"use client";

import { useEffect, useState } from "react";
import { useProgress } from "@/store/progress";

/** localStorage flag toggled from the /dev console. */
export const DEV_TOOLS_KEY = "glitch_dev_tools";

export function devToolsEnabled(): boolean {
  if (process.env.NEXT_PUBLIC_DEV_TOOLS === "1") return true;
  if (typeof window === "undefined") return false;
  return localStorage.getItem(DEV_TOOLS_KEY) === "1";
}

const ALL_PUZZLES = [
  { id: "p1-feedback-maze", digit: 4 },
  { id: "p2-bad-data", digit: 6 },
  { id: "p3-prompt-precision", digit: 2 },
  { id: "p4-fact-fiction", token: "UNLOCK5" },
  { id: "p5-final-console" },
];

export default function DevToolbar() {
  const [open, setOpen] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const { markSolved, reset } = useProgress();

  useEffect(() => {
    setEnabled(devToolsEnabled());
  }, []);

  const unlockAll = () => {
    for (const p of ALL_PUZZLES) {
      markSolved({ id: p.id, digit: p.digit, token: p.token });
    }
  };

  if (!enabled) return null;

  return (
    <div className="fixed bottom-3 right-3 z-50 flex flex-col items-end gap-2">
      {open && (
        <div className="bg-slate-900 border border-yellow-500/60 rounded-lg p-3 shadow-xl space-y-2 text-sm">
          <p className="text-yellow-400 font-semibold text-xs uppercase tracking-wide">
            ⚠ Dev Tools — Testing Only
          </p>
          <button
            onClick={unlockAll}
            className="w-full px-3 py-1.5 bg-yellow-600 hover:bg-yellow-500 text-white rounded font-medium transition-colors"
          >
            Unlock All Puzzles
          </button>
          <button
            onClick={reset}
            className="w-full px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded font-medium transition-colors"
          >
            Reset All Progress
          </button>
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        className="px-3 py-1.5 bg-yellow-600/80 hover:bg-yellow-500 text-white text-xs font-bold rounded-full shadow-lg transition-colors border border-yellow-400/40"
        aria-label="Toggle dev tools"
      >
        {open ? "✕ Dev" : "⚙ Dev"}
      </button>
    </div>
  );
}
