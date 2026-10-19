"use client";

import { ReactNode, useEffect, useState } from "react";
import { useProgress } from "@/store/progress";
import { titleList, unmetDeps } from "@/lib/puzzles";
import { Lock } from "lucide-react";

type Grants = { digit?: boolean; token?: string };

export default function PuzzleHost(props: {
  id: string;
  title: string;
  description?: string;
  requires?: string[];
  grants?: Grants;
  children?: (ctx: { markSolved: () => void; solved: boolean }) => ReactNode;
}) {
  const { id, grants, children } = props;
  const { solved, markSolved, startedAt, startRun, startTimer } = useProgress();
  const [mounted, setMounted] = useState(false);

  const missing = mounted ? unmetDeps(id, solved) : [];
  const isLocked = missing.length > 0;
  const isSolved = mounted && !!solved[id];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!startedAt) startRun();
  }, [startedAt, startRun]);

  useEffect(() => {
    if (!isLocked) startTimer();
  }, [isLocked, startTimer]);

  useEffect(() => {
    console.info("puzzle_view", { id });
  }, [id]);

  if (isLocked) {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
        <div className="rounded-full bg-amber-100 p-2 text-amber-700">
          <Lock className="h-4 w-4" />
        </div>
        <p className="text-sm text-slate-700">
          This puzzle is still locked. Solve {titleList(missing)} first.
        </p>
      </div>
    );
  }

  // No wrapper chrome: the PuzzleShell card is the one and only frame,
  // so the puzzle content gets the full width and height of the card.
  return (
    <>
      {children?.({
        markSolved: () => {
          markSolved({ id, token: grants?.token });
          console.info("puzzle_solved", { id, token: grants?.token });
        },
        solved: isSolved,
      })}
    </>
  );
}
