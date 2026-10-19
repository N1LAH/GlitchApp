"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { earnedClues, useProgress } from "@/store/progress";
import { useRouter } from "next/navigation";
import { Trophy, RotateCcw } from "lucide-react";
import { formatTime } from "@/lib/time";

const HABITS: { icon: string; title: string; body: string }[] = [
  {
    icon: "🔍",
    title: "Check it",
    body: "AI can sound confident and still be wrong, or make up sources. Check important answers with a trusted source.",
  },
  {
    icon: "🧠",
    title: "Know where it came from",
    body: "AI is only as good as the data behind it. Ask where an answer came from before you trust it.",
  },
  {
    icon: "🎯",
    title: "Be specific, then refine",
    body: "Clear, specific prompts get better results. If the answer isn't right, follow up and refine your prompt.",
  },
  {
    icon: "🧑‍✈️",
    title: "You decide",
    body: "AI is a tool, and you're in the driver's seat. A person should review AI's work before acting on anything important.",
  },
];

export default function EndPage() {
  const { solved, finishedAt, timerStartedAt, reset } = useProgress();
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [confirmingReset, setConfirmingReset] = useState(false);

  useEffect(() => setHydrated(true), []);

  const escaped = hydrated && !!solved["p5-final-console"];

  useEffect(() => {
    if (hydrated && !escaped) router.replace("/");
  }, [hydrated, escaped, router]);

  if (!escaped) return null;

  const totalTime = finishedAt && timerStartedAt ? finishedAt - timerStartedAt : null;
  const clues = earnedClues(solved);

  const handlePlayAgain = () => {
    reset();
    router.push("/start");
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(31,75,71,0.08),_transparent_30%),linear-gradient(135deg,_#fefcf6_0%,_#f8fafc_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl rounded-[32px] border border-slate-200 bg-white/90 p-6 shadow-sm sm:p-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-glitch-cream">
            <Trophy className="h-10 w-10 text-glitch-teal" />
          </div>
          <h1 className="font-display text-4xl font-bold text-slate-900 sm:text-5xl">Challenge complete!</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
            You fixed Glitch&apos;s systems and unlocked the lab door. Here&apos;s
            what you taught Glitch — and what to remember every time you use AI.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-6 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Total Time</p>
            <p className="mt-2 font-mono text-4xl font-bold text-glitch-teal">
              {totalTime === null ? "—" : formatTime(totalTime)}
            </p>
          </div>
          <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-6 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Door Code</p>
            <div className="mt-3 flex justify-center gap-2">
              {clues.map((c) => (
                <span
                  key={c.puzzleId}
                  className={`flex h-12 w-12 items-center justify-center rounded-full ${c.swatch} font-display text-2xl font-bold text-white shadow`}
                  title={c.color}
                >
                  {c.digit}
                </span>
              ))}
            </div>
          </div>
        </div>

        <section className="mt-6 rounded-[24px] border border-emerald-200 bg-emerald-50/80 p-6">
          <h2 className="font-display text-xl font-bold text-emerald-900">4 habits for using AI</h2>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {HABITS.map((h) => (
              <li key={h.title} className="rounded-2xl border border-emerald-100 bg-white p-4">
                <p className="font-semibold text-slate-900">
                  <span aria-hidden>{h.icon}</span> {h.title}
                </p>
                <p className="mt-1 text-sm text-slate-600">{h.body}</p>
              </li>
            ))}
          </ul>
        </section>

        {confirmingReset ? (
          <div className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-center" role="alert">
            <p className="font-semibold text-rose-800">
              Start a brand-new game? This clears your team&apos;s progress and time.
            </p>
            <div className="mt-3 flex flex-col justify-center gap-3 sm:flex-row">
              <Button onClick={handlePlayAgain} className="rounded-full bg-rose-600 text-white hover:bg-rose-700">
                Yes, start over
              </Button>
              <Button onClick={() => setConfirmingReset(false)} variant="outline" className="rounded-full border-slate-300 bg-white text-slate-700">
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button onClick={() => setConfirmingReset(true)} variant="outline" className="flex-1 rounded-full border-slate-300 bg-white text-slate-700 hover:bg-slate-50">
              <RotateCcw className="mr-2 h-4 w-4" />
              Play Again
            </Button>
            <Button onClick={() => router.push("/")} className="flex-1 rounded-full bg-glitch-teal text-white hover:bg-glitch-teal/90">
              Return to Lab
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
