"use client";

import { useEffect, useState } from "react";
import GlitchSpeech from "@/components/GlitchSpeech";
import { CLUES, DOOR_CODE } from "@/lib/clues";
import { allPuzzles } from "@/lib/puzzles";

const MAX_TRIES = 3;
const LOCKOUT_SECONDS = 30;

/** Clues listed in puzzle order, not code order — the color order comes from the team handout. */
const DISPLAY_CLUES = [...CLUES].sort(
  (a, b) =>
    allPuzzles.findIndex((p) => p.id === a.puzzleId) -
    allPuzzles.findIndex((p) => p.id === b.puzzleId)
);

interface Props {
  /** Which puzzles are solved — clues reveal one by one as digits are earned. */
  solved: Record<string, boolean>;
  /** Called when the correct code is entered. */
  onUnlock: () => void;
}

export default function P5FinalConsole({ solved, onUnlock }: Props) {
  const code = DOOR_CODE;
  const [mounted, setMounted] = useState(false);
  const [entry, setEntry] = useState("");
  const [status, setStatus] = useState<"idle" | "error" | "success">("idle");
  const [wrongTries, setWrongTries] = useState(0);
  const [lockedFor, setLockedFor] = useState(0);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (lockedFor <= 0) return;
    const t = window.setTimeout(() => setLockedFor((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [lockedFor]);

  const disabled = status === "success" || lockedFor > 0;

  const press = (d: string) => {
    if (disabled || entry.length >= code.length) return;
    setStatus("idle");
    setEntry((e) => e + d);
  };

  const backspace = () => {
    if (disabled) return;
    setStatus("idle");
    setEntry((e) => e.slice(0, -1));
  };

  const clear = () => {
    if (disabled) return;
    setStatus("idle");
    setEntry("");
  };

  const submit = () => {
    if (disabled) return;
    if (entry === code) {
      setStatus("success");
      onUnlock();
      return;
    }
    setStatus("error");
    setEntry("");
    const tries = wrongTries + 1;
    if (tries >= MAX_TRIES) {
      setWrongTries(0);
      setLockedFor(LOCKOUT_SECONDS);
    } else {
      setWrongTries(tries);
    }
  };

  const keyClass =
    "rounded-2xl border border-slate-300 bg-white py-3 font-semibold shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-50";

  return (
    <div className="space-y-4 text-slate-700">
      <p className="text-sm text-slate-600">
        Enter the three-digit code to unlock the lab door. Your handout shows
        which color comes first.
      </p>

      <div className="rounded-[24px] border border-slate-200 bg-white/80 p-4 shadow-sm">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Clues collected</p>
        <div className="flex flex-wrap gap-2">
          {DISPLAY_CLUES.map((c) => (
            <span key={c.color} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-700">
              <span className={`h-3 w-3 rounded-full ${c.swatch}`} />
              {mounted && solved[c.puzzleId] ? `${c.color} ${c.digit}` : `${c.color} ?`}
            </span>
          ))}
        </div>
      </div>

      <div className="flex justify-center gap-3">
        {Array.from({ length: code.length }).map((_, i) => (
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
          <button key={d} onClick={() => press(d)} disabled={disabled} className={`${keyClass} text-lg text-slate-800`}>
            {d}
          </button>
        ))}
        <button onClick={backspace} disabled={disabled} className={`${keyClass} text-sm text-slate-700`} aria-label="Delete last digit">
          ⌫
        </button>
        <button onClick={() => press("0")} disabled={disabled} className={`${keyClass} text-lg text-slate-800`}>
          0
        </button>
        <button onClick={clear} disabled={disabled} className={`${keyClass} text-sm text-slate-700`}>
          Clear
        </button>
      </div>

      <button
        onClick={submit}
        disabled={entry.length !== code.length || disabled}
        className="w-full rounded-full bg-glitch-teal py-3 font-semibold text-white transition-colors hover:bg-glitch-teal/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === "success"
          ? "Door Unlocked!"
          : lockedFor > 0
            ? `Keypad cooling down… ${lockedFor}s`
            : "Unlock the Door"}
      </button>

      {status === "error" && (
        <div role="alert">
          <GlitchSpeech mood="worried">
            {lockedFor > 0 ? (
              <>
                Access denied — too many wrong codes! The keypad is locked for{" "}
                {lockedFor} seconds. Use the time to check your handout for the
                color order.
              </>
            ) : (
              <>
                Access denied — that code didn&apos;t work. Check your color
                clues and your handout, then try again!{" "}
                {MAX_TRIES - wrongTries === 1 ? "One more wrong try locks the keypad for a bit." : ""}
              </>
            )}
          </GlitchSpeech>
        </div>
      )}
      {status === "success" && (
        <div role="status">
          <GlitchSpeech mood="happy">
            Access granted! The lab door slides open — we escaped!
          </GlitchSpeech>
        </div>
      )}
    </div>
  );
}
