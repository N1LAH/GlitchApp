"use client";

import { Button } from "@/components/ui/button";
import { useProgress } from "@/store/progress";
import { useRouter } from "next/navigation";

const PUZZLE_GUIDE: { icon: string; name: string; how: string }[] = [
  {
    icon: "🧭",
    name: "Feedback Maze",
    how: "Guide Glitch through the maze by rewarding good moves and flagging wrong turns — that's reinforcement learning.",
  },
  {
    icon: "🧠",
    name: "Bad Data",
    how: "Mark each source as credible or not credible so Glitch can rebuild a trustworthy report.",
  },
  {
    icon: "📝",
    name: "Prompt Precision",
    how: "Assemble a strong prompt by placing the right instruction card in each slot.",
  },
  {
    icon: "✅",
    name: "Fact or Fiction",
    how: "Drag each statement into the Fact or Fiction column to help Glitch tell truth from nonsense.",
  },
  {
    icon: "🔐",
    name: "Final Console",
    how: "Use the color clues you collected to enter the three-digit code and unlock the door.",
  },
];

export default function HowToPlayPage() {
  const { reset } = useProgress();
  const router = useRouter();

  const handleReset = () => {
    if (
      confirm(
        "This will erase all your progress. Are you sure you want to reset?"
      )
    ) {
      reset();
      alert("Progress reset successfully!");
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(31,75,71,0.08),_transparent_30%),linear-gradient(135deg,_#fefcf6_0%,_#f8fafc_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl rounded-[32px] border border-slate-200 bg-white/90 p-6 shadow-sm sm:p-8">
        <h1 className="font-display text-3xl font-bold text-slate-900">
          How to Play
        </h1>

        <div className="mt-4 rounded-2xl border-l-4 border-glitch-teal bg-glitch-cream/70 p-4">
          <h2 className="font-display text-lg font-bold text-slate-800">
            🤖 Welcome to Glitch Lab
          </h2>
          <p className="mt-1 text-slate-600">
            You&apos;re locked in an AI research lab with Glitch, a glitchy lab
            AI. Solve five AI-themed puzzles to collect digits, then enter the
            code on the final console to escape.
          </p>
        </div>

        <section className="mt-6">
          <h3 className="font-display text-lg font-bold text-slate-800">
            Gameplay
          </h3>
          <ul className="mt-2 space-y-2 text-slate-600">
            <li>
              <strong className="text-slate-800">Explore:</strong> click the
              glowing objects in the lab (or use Tab + Enter) to open puzzles.
            </li>
            <li>
              <strong className="text-slate-800">Solve:</strong> each puzzle
              teaches an AI idea and grants a digit or token.
            </li>
            <li>
              <strong className="text-slate-800">Unlock:</strong> some puzzles
              require others first — check the lab hub for what&apos;s open.
            </li>
            <li>
              <strong className="text-slate-800">Escape:</strong> enter the
              three-digit code on the Final Console to unlock the door.
            </li>
          </ul>
        </section>

        <section className="mt-6">
          <h3 className="font-display text-lg font-bold text-slate-800">
            The Puzzles
          </h3>
          <ul className="mt-2 space-y-2">
            {PUZZLE_GUIDE.map((p) => (
              <li
                key={p.name}
                className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-3"
              >
                <span className="text-xl" aria-hidden>
                  {p.icon}
                </span>
                <p className="text-sm text-slate-600">
                  <strong className="text-slate-800">{p.name}:</strong> {p.how}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button
            onClick={() => router.push("/")}
            className="rounded-full bg-glitch-teal text-white hover:bg-glitch-teal/90"
          >
            Back to Lab
          </Button>
          <Button
            onClick={handleReset}
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
