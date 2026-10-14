"use client";

import { useState } from "react";
import GlitchSpeech from "@/components/GlitchSpeech";

/**
 * Final console keypad.
 *
 * Clue scheme (easy for Liz to change): each core puzzle awards a colored digit,
 * and the door code is those digits entered in the order shown below.
 * To change the answer, edit CLUES (order matters) — CODE is derived from it.
 * Shared with the lab hub (solved-hotspot tooltips) and the reward screens.
 */
export const CLUES: {
  color: string;
  label: string;
  puzzleId: string;
  digit: number;
  swatch: string;
  text: string;
}[] = [
  { color: "Green", label: "Prompt Precision", puzzleId: "p3-prompt-precision", digit: 2, swatch: "bg-green-500", text: "text-green-600" },
  { color: "Blue", label: "Feedback Maze", puzzleId: "p1-feedback-maze", digit: 4, swatch: "bg-blue-500", text: "text-blue-600" },
  { color: "Red", label: "Bad Data", puzzleId: "p2-bad-data", digit: 6, swatch: "bg-red-500", text: "text-red-600" },
];

const CODE = CLUES.map((c) => c.digit).join(""); // "246"

interface Props {
  /** Which puzzles are solved — clues reveal one by one as digits are earned. */
  solved: Record<string, boolean>;
  /** Called when the correct code is entered. */
  onUnlock: () => void;
}

export default function P5FinalConsole({ solved, onUnlock }: Props) {
  const [entry, setEntry] = useState("");
  const [status, setStatus] = useState<"idle" | "error" | "success">("idle");

  const press = (d: string) => {
    if (status === "success") return;
    if (entry.length >= CODE.length) return;
    setStatus("idle");
    setEntry((e) => e + d);
  };

  const backspace = () => {
    if (status === "success") return;
    setStatus("idle");
    setEntry((e) => e.slice(0, -1));
  };

  const clear = () => {
    if (status === "success") return;
    setStatus("idle");
    setEntry("");
  };

  const submit = () => {
    if (status === "success") return;
    if (entry === CODE) {
      setStatus("success");
      onUnlock();
    } else {
      setStatus("error");
      setEntry("");
    }
  };

  return (
    <div className="space-y-4 text-slate-700">
      <p className="text-sm text-slate-600">Enter the three-digit code to unlock the lab door.</p>

      <div className="rounded-[24px] border border-slate-200 bg-white/80 p-4 shadow-sm">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Clues collected</p>
        <div className="flex flex-wrap gap-2">
          {CLUES.map((c) => (
            <span key={c.color} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-700">
              <span className={`h-3 w-3 rounded-full ${c.swatch}`} />
              {solved[c.puzzleId] ? `${c.color} ${c.digit}` : `${c.color} ?`}
            </span>
          ))}
        </div>
      </div>

      <div className="flex justify-center gap-3">
        {Array.from({ length: CODE.length }).map((_, i) => (
          <div
            key={i}
            className={`flex h-14 w-12 items-center justify-center rounded-2xl border-2 text-2xl font-bold ${
              status === "success"
                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                : status === "error"
                  ? "border-rose-500 bg-rose-50 text-rose-700"
                  : "border-slate-300 bg-slate-50 text-slate-900"
            }`}
          >
            {entry[i] ?? ""}
          </div>
        ))}
      </div>

      <div className="mx-auto grid max-w-xs grid-cols-3 gap-2">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
          <button
            key={d}
            onClick={() => press(d)}
            disabled={status === "success"}
            className="rounded-2xl border border-slate-300 bg-white py-3 text-lg font-semibold text-slate-800 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-50"
          >
            {d}
          </button>
        ))}
        <button onClick={backspace} disabled={status === "success"} className="rounded-2xl border border-slate-300 bg-white py-3 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-50">
          ⌫
        </button>
        <button onClick={() => press("0")} disabled={status === "success"} className="rounded-2xl border border-slate-300 bg-white py-3 text-lg font-semibold text-slate-800 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-50">
          0
        </button>
        <button onClick={clear} disabled={status === "success"} className="rounded-2xl border border-slate-300 bg-white py-3 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-50">
          Clear
        </button>
      </div>

      <button
        onClick={submit}
        disabled={entry.length !== CODE.length || status === "success"}
        className="w-full rounded-full bg-glitch-teal py-3 font-semibold text-white transition-colors hover:bg-glitch-teal/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === "success" ? "Door Unlocked!" : "Unlock the Door"}
      </button>

      {status === "error" && (
        <div role="alert">
          <GlitchSpeech mood="worried">
            Access denied — that code didn&apos;t work. Check your color clues
            and try again!
          </GlitchSpeech>
        </div>
      )}
      {status === "success" && (
        <div role="status">
          <GlitchSpeech mood="happy">
            Access granted! The lab door slides open — we escaped! You&apos;re
            officially an AI expert.
          </GlitchSpeech>
        </div>
      )}
    </div>
  );
}
