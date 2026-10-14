"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, HelpCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export type PuzzleTheme = "orange" | "purple" | "green" | "red" | "blue";

/**
 * Reusable Figma-style puzzle shell: themed gradient background + light white card
 * with an accent header (icon chip + title + "Return to Lab").
 *
 * Template for restyling each puzzle screen — see DESIGN-NOTES.md.
 * Usage:
 *   <PuzzleShell theme="orange" title="Garbage In, Garbage Out" icon="🗃️">
 *     <ConceptCallout theme="orange" title="AI is only as good as its data">...</ConceptCallout>
 *     ...puzzle body...
 *   </PuzzleShell>
 */
const THEME: Record<
  PuzzleTheme,
  { bg: string; chip: string; heading: string; ring: string }
> = {
  orange: {
    bg: "from-orange-50 to-amber-100",
    chip: "bg-puzzle-orange",
    heading: "text-orange-900",
    ring: "focus:ring-puzzle-orange/40",
  },
  purple: {
    bg: "from-purple-50 to-fuchsia-100",
    chip: "bg-puzzle-purple",
    heading: "text-purple-900",
    ring: "focus:ring-puzzle-purple/40",
  },
  green: {
    bg: "from-emerald-50 to-green-100",
    chip: "bg-puzzle-green",
    heading: "text-emerald-900",
    ring: "focus:ring-puzzle-green/40",
  },
  red: {
    bg: "from-rose-50 to-red-100",
    chip: "bg-puzzle-red",
    heading: "text-rose-900",
    ring: "focus:ring-puzzle-red/40",
  },
  blue: {
    bg: "from-sky-50 to-blue-100",
    chip: "bg-puzzle-blue",
    heading: "text-blue-900",
    ring: "focus:ring-puzzle-blue/40",
  },
};

export default function PuzzleShell({
  theme,
  title,
  icon,
  children,
}: {
  theme: PuzzleTheme;
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  const router = useRouter();
  const t = THEME[theme];

  return (
    <div className={`min-h-screen w-full bg-gradient-to-br ${t.bg} p-2 sm:p-4`}>
      <div className="mx-auto max-w-4xl rounded-3xl bg-white p-4 sm:p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl text-white ${t.chip}`}
            >
              {icon}
            </span>
            <h1 className={`font-display text-2xl font-bold ${t.heading}`}>
              {title}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span
              className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-600 shadow-md"
              title="Glitch, your AI friend"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/images/glitch-mascot.webp"
                alt="Glitch, your AI friend"
                className="h-9 w-9 object-contain"
                style={{ imageRendering: "pixelated" }}
              />
            </span>
            <Dialog>
              <DialogTrigger asChild>
                <button
                  className={`inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 ${t.ring}`}
                >
                  <HelpCircle className="h-4 w-4" />
                  Hint
                </button>
              </DialogTrigger>
              <DialogContent className="border-slate-200 bg-white">
                <DialogHeader>
                  <DialogTitle className="text-slate-900">Need a Hint?</DialogTitle>
                  <DialogDescription className="text-slate-600">
                    Ask your instructor for a hint to help you solve this puzzle.
                  </DialogDescription>
                </DialogHeader>
                <p className="mt-2 text-sm text-slate-600">
                  Hints are available during the session. Remember to work
                  through the problem systematically and review any feedback
                  you&apos;ve received.
                </p>
              </DialogContent>
            </Dialog>
            <button
              onClick={() => router.push("/")}
              className={`inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 ${t.ring}`}
            >
              <ArrowLeft className="h-4 w-4" />
              Return to Lab
            </button>
          </div>
        </div>
        <div className="space-y-4 text-slate-700">{children}</div>
      </div>
    </div>
  );
}

/** Tinted concept callout box (teaches the AI concept). */
export function ConceptCallout({
  theme,
  title,
  children,
}: {
  theme: PuzzleTheme;
  title: string;
  children: ReactNode;
}) {
  const tint: Record<PuzzleTheme, string> = {
    orange: "bg-orange-50 border-puzzle-orange/40",
    purple: "bg-purple-50 border-puzzle-purple/40",
    green: "bg-emerald-50 border-puzzle-green/40",
    red: "bg-rose-50 border-puzzle-red/40",
    blue: "bg-sky-50 border-puzzle-blue/40",
  };
  return (
    <div className={`rounded-2xl border-l-4 p-4 ${tint[theme]}`}>
      <h2 className="font-display text-lg font-bold text-slate-800">{title}</h2>
      <div className="mt-1 text-slate-600">{children}</div>
    </div>
  );
}

/** Highlighted "Your Mission" box. */
export function MissionBox({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4">
      <p className="font-display font-bold text-sky-900">🚀 Your Mission</p>
      <div className="mt-1 text-slate-700">{children}</div>
    </div>
  );
}
