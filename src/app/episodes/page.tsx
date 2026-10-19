"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useProgress } from "@/store/progress";
import { allPuzzles, titleList, unmetDeps } from "@/lib/puzzles";
import { clueFor } from "@/lib/clues";
import { useRouter } from "next/navigation";

export default function EpisodesPage() {
  const [hydrated, setHydrated] = useState(false);
  const { solved, codeDigits } = useProgress();
  const router = useRouter();

  useEffect(() => {
    setHydrated(true);
  }, []);

  const getPuzzleStatus = (puzzleId: string) => {
    if (!hydrated) return "available";
    if (solved[puzzleId]) return "solved";
    if (unmetDeps(puzzleId, solved).length > 0) return "locked";
    return "available";
  };

  const rewardText = (puzzleId: string, isSolved: boolean) => {
    const clue = clueFor(puzzleId);
    if (clue) {
      return isSolved ? (
        <span className={`font-semibold ${clue.text}`}>
          Reward: {clue.color} {codeDigits[puzzleId]}
        </span>
      ) : (
        <span>Reward: a colored digit for the door code</span>
      );
    }
    if (puzzleId === "p4-fact-fiction") {
      return isSolved ? (
        <span className="font-semibold text-glitch-teal">Reward: 🔑 keypad key collected</span>
      ) : (
        <span>Reward: a key that helps switch on the keypad</span>
      );
    }
    return <span>Unlock the door</span>;
  };

  const solvedCount = hydrated ? allPuzzles.filter((p) => solved[p.id]).length : 0;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(31,75,71,0.08),_transparent_30%),linear-gradient(135deg,_#fefcf6_0%,_#f8fafc_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 rounded-[32px] border border-slate-200 bg-white/80 p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold text-slate-900 sm:text-4xl">📋 Mission Log</h1>
              <p className="mt-3 max-w-2xl text-base text-slate-600">
                Solve the first four puzzles in any order. Three of them give
                you a colored digit, and Fact or Fiction gives you a key. Once
                all four are solved, the keypad by the door switches on.
              </p>
            </div>
            <div className="rounded-2xl border border-glitch-teal/20 bg-glitch-cream/80 px-4 py-3">
              <p className="text-sm font-semibold text-glitch-teal">Progress</p>
              <p className="text-2xl font-bold text-slate-900">
                {solvedCount}/{allPuzzles.length}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          {allPuzzles.map((puzzle) => {
            const status = getPuzzleStatus(puzzle.id);
            const deps = hydrated ? unmetDeps(puzzle.id, solved) : [];
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
                      <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">
                        {puzzle.label}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{puzzle.description}</p>
                  </div>
                  <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-700">
                    {status === "solved" ? "✓ Solved" : status === "locked" ? "🔒 Locked" : "Available"}
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-sm text-slate-600">{rewardText(puzzle.id, status === "solved")}</div>
                  <div className="flex flex-wrap items-center gap-2">
                    {status === "locked" && deps.length > 0 && (
                      <span className="text-sm text-slate-500">Solve {titleList(deps)} first</span>
                    )}
                    <Button
                      size="sm"
                      onClick={() => router.push(`/puzzles/${puzzle.id}`)}
                      disabled={status === "locked"}
                      className={status === "locked" ? "cursor-not-allowed opacity-50" : "rounded-full bg-glitch-teal text-white hover:bg-glitch-teal/90"}
                    >
                      {status === "solved" ? "Play again" : "Start"}
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
        </div>
      </div>
    </main>
  );
}
