"use client";

import { useEffect, useState } from "react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useProgress } from "@/store/progress";
import { byId } from "@/lib/puzzles";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import PuzzleHost from "@/components/puzzle/PuzzleHost";
import P1ReinforcementMaze from "@/components/puzzle/P1ReinforcementMaze";
import P2BadData from "@/components/puzzle/P2BadData";
import P3PromptAssembly from "@/components/puzzle/P3PromptAssembly";
import P4FactFiction from "@/components/puzzle/P4FactFiction";
import P5FinalConsole, { CLUES } from "@/components/puzzle/P5FinalConsole";
import PuzzleShell, { ConceptCallout, type PuzzleTheme } from "@/components/puzzle/PuzzleShell";
import { devToolsEnabled } from "@/components/DevToolbar";

const puzzleShellConfig: Record<string, { theme: PuzzleTheme; icon: string; conceptTitle: string; conceptBody: string }> = {
  maze: {
    theme: "purple",
    icon: "🧭",
    conceptTitle: "Reinforcement learning rewards better choices",
    conceptBody: "Glitch learns by trying, getting feedback, and updating its path. Each reward helps it choose more wisely next time.",
  },
  multiselect: {
    theme: "orange",
    icon: "🧠",
    conceptTitle: "Good AI needs reliable input",
    conceptBody: "When Glitch uses weak or fake sources, its answers become misleading. Strong evidence helps the system stay accurate.",
  },
  "text-entry": {
    theme: "blue",
    icon: "📝",
    conceptTitle: "Prompt precision matters",
    conceptBody: "A clear prompt gives an AI the right instructions. The better the structure, the more useful the output becomes.",
  },
  slider: {
    theme: "green",
    icon: "✅",
    conceptTitle: "Separate facts from fiction",
    conceptBody: "AI can mix truth and nonsense when it is not careful. Sorting real facts from false claims helps it think more clearly.",
  },
  keypad: {
    theme: "red",
    icon: "🔐",
    conceptTitle: "Clues become a code",
    conceptBody: "The door code is hidden in puzzle clues. Use what you learned to find the final sequence and unlock the lab.",
  },
};

export default function PuzzlePage({ params }: { params: { id: string } }) {
  const [hydrated, setHydrated] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const { solved, finishRun } = useProgress();
  const router = useRouter();
  const puzzle = byId(params.id);

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!puzzle) {
    return (
      <Container className="py-8">
        <Alert className="mx-auto max-w-2xl border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Puzzle not found. Please return to the lab.
          </AlertDescription>
        </Alert>
        <div className="mt-4 text-center">
          <Button onClick={() => router.push("/")}>Back to Lab</Button>
        </div>
      </Container>
    );
  }

  const shellConfig = puzzleShellConfig[puzzle.kind] ?? puzzleShellConfig["keypad"];
  const clue = CLUES.find((c) => c.puzzleId === puzzle.id);

  // Post-solve congratulations screen: "Your Reward is …" (item 14c/14d).
  if (showReward && puzzle.kind !== "keypad") {
    return (
      <PuzzleShell theme={shellConfig.theme} title={puzzle.title} icon={shellConfig.icon}>
            <div className="space-y-5 py-4 text-center">
              <p className="text-6xl" aria-hidden>🎉</p>
              <h2 className="font-display text-3xl font-bold text-slate-900">
                Congratulations!
              </h2>

              <ConceptCallout theme={shellConfig.theme} title={shellConfig.conceptTitle}>
                <p>{shellConfig.conceptBody}</p>
              </ConceptCallout>

              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                Your reward is
              </p>
              {clue ? (
                <div className="flex items-center justify-center gap-3">
                  <span
                    className={`flex h-20 w-20 items-center justify-center rounded-full ${clue.swatch} font-display text-5xl font-bold text-white shadow-lg`}
                  >
                    {clue.digit}
                  </span>
                  <span className={`font-display text-2xl font-bold ${clue.text}`}>
                    {clue.color} {clue.digit}
                  </span>
                </div>
              ) : (
                <p className="font-display text-3xl font-bold text-emerald-700">
                  🔓 Keypad Unlocked
                </p>
              )}
              <p className="text-sm text-slate-500">
                {clue
                  ? "Remember the color — it's a clue to the door-code order!"
                  : "The keypad next to the door is now active. Time to crack the code!"}
              </p>

              <Button
                onClick={() => router.push("/")}
                className="rounded-full bg-glitch-teal px-8 py-3 text-white hover:bg-glitch-teal/90"
              >
                Return to Lab
              </Button>
            </div>
      </PuzzleShell>
    );
  }

  return (
    <PuzzleShell theme={shellConfig.theme} title={puzzle.title} icon={shellConfig.icon}>
          <PuzzleHost
            id={puzzle.id}
            title={puzzle.title}
            description={puzzle.description}
            requires={puzzle.requires}
            grants={puzzle.grants}
          >
            {({ markSolved, solved: isSolved }) => (
              <>
                {puzzle.kind === "maze" && <P1ReinforcementMaze onSolved={() => markSolved()} />}

                {puzzle.kind === "multiselect" && <P2BadData onSolved={() => markSolved()} />}

                {puzzle.kind === "text-entry" && <P3PromptAssembly onSolved={() => markSolved()} />}

                {puzzle.kind === "slider" && <P4FactFiction onSolved={() => markSolved()} solved={isSolved} />}

                {puzzle.kind === "keypad" && (
                  <P5FinalConsole
                    solved={solved}
                    onUnlock={() => {
                      markSolved();
                      finishRun();
                      router.push("/end");
                    }}
                  />
                )}

                {isSolved && puzzle.kind !== "keypad" && (
                  <div className="mt-4">
                    <Button
                      onClick={() => setShowReward(true)}
                      className="w-full rounded-full bg-glitch-teal py-3 text-base font-semibold text-white hover:bg-glitch-teal/90"
                    >
                      Next →
                    </Button>
                  </div>
                )}

                {!isSolved && puzzle.kind !== "keypad" && hydrated && devToolsEnabled() && (
                  <div className="mt-4">
                    <Button
                      onClick={() => markSolved()}
                      className="rounded-full bg-glitch-teal text-white hover:bg-glitch-teal/90"
                    >
                      Mark as Solved (Demo)
                    </Button>
                  </div>
                )}
              </>
            )}
          </PuzzleHost>
    </PuzzleShell>
  );
}
