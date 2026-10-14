"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useProgress } from "@/store/progress";
import { allPuzzles, unmetDeps } from "@/lib/puzzles";
import { useRouter } from "next/navigation";

export default function EpisodesPage() {
  const [hydrated, setHydrated] = useState(false);
  const { solved, reset } = useProgress();
  const router = useRouter();

  useEffect(() => {
    setHydrated(true);
  }, []);

  const getPuzzleStatus = (puzzleId: string) => {
    if (!hydrated) return "available";
    if (solved[puzzleId]) return "solved";
    const deps = unmetDeps(puzzleId, solved);
    if (deps.length > 0) return "locked";
    return "available";
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(31,75,71,0.08),_transparent_30%),linear-gradient(135deg,_#fefcf6_0%,_#f8fafc_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 rounded-[32px] border border-slate-200 bg-white/80 p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-glitch-teal">Mission Control</p>
              <h1 className="mt-2 font-display text-3xl font-bold text-slate-900 sm:text-4xl">Choose your next challenge</h1>
              <p className="mt-3 max-w-2xl text-base text-slate-600">
                Complete each puzzle to unlock the next one and collect digits for the final door.
              </p>
            </div>
            <div className="rounded-2xl border border-glitch-teal/20 bg-glitch-cream/80 px-4 py-3">
              <p className="text-sm font-semibold text-glitch-teal">Progress</p>
              <p className="text-2xl font-bold text-slate-900">
                {Object.values(solved).filter(Boolean).length}/{allPuzzles.length}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          {allPuzzles.map((puzzle) => {
            const status = getPuzzleStatus(puzzle.id);
            const deps = unmetDeps(puzzle.id, solved);
            const cardTone =
              status === "solved"
                ? "border-emerald-200 bg-emerald-50/70"
                : status === "locked"
                  ? "border-slate-200 bg-white/70 opacity-70"
                  : "border-slate-200 bg-white/90 shadow-sm hover:shadow-md";

            return (
              <div key={puzzle.id} className={`rounded-[24px] border p-5 transition-all ${cardTone}`}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-semibold text-slate-900">{puzzle.title}</h2>
                      <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                        {puzzle.kind}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{puzzle.description}</p>
                  </div>
                  <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-700">
                    {status === "solved" ? "✓ Solved" : status === "locked" ? "🔒 Locked" : "Available"}
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-sm text-slate-600">
                    {puzzle.grants?.digit && <span className="font-semibold text-glitch-teal">Grants Digit: {puzzle.grants.digit}</span>}
                    {puzzle.grants?.token && <span className="ml-2 font-semibold text-glitch-teal">Grants Token: {puzzle.grants.token}</span>}
                    {!puzzle.grants && <span>Unlock the Door</span>}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {status === "locked" && deps.length > 0 && (
                      <span className="text-sm text-slate-500">Requires: {deps.length} puzzle(s)</span>
                    )}
                    <Button
                      size="sm"
                      onClick={() => router.push(`/puzzles/${puzzle.id}`)}
                      disabled={status === "locked"}
                      className={status === "locked" ? "cursor-not-allowed opacity-50" : "rounded-full bg-glitch-teal text-white hover:bg-glitch-teal/90"}
                    >
                      {status === "solved" ? "Review" : "Start"}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button onClick={() => router.push("/")} variant="outline" className="rounded-full border-slate-300 bg-white text-slate-700 hover:bg-slate-50">
            Back to Lab
          </Button>
          <Button
            onClick={() => {
              if (confirm("Reset all progress? This will mark all puzzles as unsolved.")) {
                reset();
                router.refresh();
              }
            }}
            variant="outline"
            className="rounded-full border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
          >
            Reset Progress
          </Button>
        </div>
      </div>
    </main>
  );
}
