"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { HelpCircle } from "lucide-react";

type PuzzleHUDProps = {
  title: string;
  status: "Locked" | "Available" | "Solved";
};

export default function PuzzleHUD({ title, status }: PuzzleHUDProps) {
  const statusClasses =
    status === "Solved"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : status === "Locked"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : "border-sky-200 bg-sky-50 text-sky-700";

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        <Badge
          variant={status === "Solved" ? "default" : status === "Locked" ? "secondary" : "outline"}
          className={`${statusClasses} rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]`}
        >
          {status}
        </Badge>
      </div>
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-slate-300 bg-white text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <HelpCircle className="mr-1 h-4 w-4" />
            Hint
          </Button>
        </DialogTrigger>
        <DialogContent className="border-slate-200 bg-white">
          <DialogHeader>
            <DialogTitle className="text-slate-900">Need a Hint?</DialogTitle>
            <DialogDescription className="text-slate-600">
              Ask your instructor for a hint to help you solve this puzzle.
            </DialogDescription>
          </DialogHeader>
          <p className="mt-2 text-sm text-slate-600">
            Hints are available during the session. Remember to work through the problem systematically and review any feedback you&apos;ve received.
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
