"use client";

import { Button } from "@/components/ui/button";
import { useProgress } from "@/store/progress";
import { useRouter } from "next/navigation";
import { CheckCircle2, Trophy, RotateCcw } from "lucide-react";

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const mm = Math.floor(totalSeconds / 60);
  const ss = totalSeconds % 60;
  return `${mm.toString().padStart(2, "0")}:${ss.toString().padStart(2, "0")}`;
}

export default function EndPage() {
  const { finishedAt, startedAt, digits, reset } = useProgress();
  const router = useRouter();

  const totalTime = finishedAt && startedAt ? finishedAt - startedAt : 0;

  const handlePlayAgain = () => {
    if (confirm("This will reset all your progress. Are you sure you want to play again?")) {
      reset();
      router.push("/start");
    }
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
            You solved the lab puzzles and unlocked the final door. Glitch is ready for the next mission.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-6 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Total Time</p>
            <p className="mt-2 font-mono text-4xl font-bold text-glitch-teal">{formatTime(totalTime)}</p>
          </div>
          <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-6 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Digits Collected</p>
            <p className="mt-2 text-4xl font-bold text-glitch-teal">{digits.length}/3</p>
            <div className="mt-3 flex justify-center gap-2">
              {digits.map((digit, idx) => (
                <span key={idx} className="rounded-full bg-glitch-cream px-3 py-1 font-semibold text-slate-900">
                  {digit}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-[24px] border border-emerald-200 bg-emerald-50/80 p-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-1 h-6 w-6 flex-shrink-0 text-emerald-600" />
            <div>
              <h2 className="font-semibold text-emerald-800">All puzzles solved</h2>
              <ul className="mt-2 space-y-1 text-sm text-slate-700">
                <li>✓ Feedback Maze</li>
                <li>✓ Bad Data</li>
                <li>✓ Prompt Precision</li>
                <li>✓ Fact or Fiction</li>
                <li>✓ Final Console</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button onClick={handlePlayAgain} variant="outline" className="flex-1 rounded-full border-slate-300 bg-white text-slate-700 hover:bg-slate-50">
            <RotateCcw className="mr-2 h-4 w-4" />
            Play Again
          </Button>
          <Button onClick={() => router.push("/")} className="flex-1 rounded-full bg-glitch-teal text-white hover:bg-glitch-teal/90">
            Return to Lab
          </Button>
        </div>
      </div>
    </main>
  );
}
