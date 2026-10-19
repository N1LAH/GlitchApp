"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const PUZZLE_GUIDE: { icon: string; name: string; how: string }[] = [
  {
    icon: "🧭",
    name: "Feedback Maze",
    how: "Glitch suggests each move. Give it a 👍 or 👎 to train it to find the Bridge. Earns a colored digit.",
  },
  {
    icon: "🧠",
    name: "Bad Data",
    how: "Mark each source as credible or not credible so Glitch can rebuild its report. Earns a colored digit.",
  },
  {
    icon: "📝",
    name: "Prompt Precision",
    how: "Build a clear, specific prompt by placing the right card in each slot. Earns a colored digit.",
  },
  {
    icon: "✅",
    name: "Fact or Fiction",
    how: "Sort each statement about AI into Fact or Fiction. Earns the key that helps switch on the keypad.",
  },
  {
    icon: "🔐",
    name: "Final Console",
    how: "Switches on once the other four puzzles are solved. Enter your three colored digits in the color order on your handout.",
  },
];

export default function HowToPlayPage() {
  const router = useRouter();

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
            AI. Solve four AI puzzles: three give you a colored digit and one
            gives you a key. Then enter the door code on the keypad to escape.
            Check your team handout for clues, including the color order.
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
              teaches an AI idea. Feedback Maze, Bad Data and Prompt Precision
              each give a colored digit; Fact or Fiction gives a key.
            </li>
            <li>
              <strong className="text-slate-800">Unlock:</strong> the first
              four puzzles are open from the start, in any order. The keypad by
              the door switches on once all four are solved.
            </li>
            <li>
              <strong className="text-slate-800">Escape:</strong> enter your
              three colored digits in the color order shown on your handout.
            </li>
            <li>
              <strong className="text-slate-800">Stuck?</strong> every puzzle
              has a Hint button with hints that get more specific each time.
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
        </div>
      </div>
    </main>
  );
}
