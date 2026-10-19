"use client";

import { useEffect, useState } from "react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useProgress } from "@/store/progress";
import { byId, unmetDeps } from "@/lib/puzzles";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import PuzzleHost from "@/components/puzzle/PuzzleHost";
import P1ReinforcementMaze from "@/components/puzzle/P1ReinforcementMaze";
import P2BadData from "@/components/puzzle/P2BadData";
import P3PromptAssembly from "@/components/puzzle/P3PromptAssembly";
import P4FactFiction from "@/components/puzzle/P4FactFiction";
import P5FinalConsole from "@/components/puzzle/P5FinalConsole";
import { clueFor } from "@/lib/clues";
import PuzzleShell, { ConceptCallout, type PuzzleTheme } from "@/components/puzzle/PuzzleShell";
import { devToolsEnabled } from "@/components/DevToolbar";

const puzzleShellConfig: Record<
  string,
  { theme: PuzzleTheme; icon: string; conceptTitle: string; conceptBody: string; hints: string[] }
> = {
  maze: {
    theme: "purple",
    icon: "🧭",
    conceptTitle: "Feedback helps AI improve",
    conceptBody: "Glitch learned by trying moves and getting your feedback, so good feedback taught it good habits. Chat apps can learn from feedback over time too, but a thumbs-up doesn't change the AI in the middle of your conversation. To get a better answer right now, follow up and refine your prompt.",
    hints: [
      "The Bridge is marked with a 🏁 flag at the top left. Before you answer, look at the glowing circle: does that move bring Glitch closer to the flag?",
      "Short paths that stop at a wall are dead ends. Give a 👎 to any move into one, and to moves that head away from the Bridge.",
      "The shortest route is Lab → Medical → Crew Quarters → Rec Room → Gym → Cafe → Bridge.",
    ],
  },
  multiselect: {
    theme: "orange",
    icon: "🧠",
    conceptTitle: "Good AI needs reliable input",
    conceptBody: "When Glitch uses weak or fake sources, its answers become misleading. Good sources help, but AI can still make mistakes or make things up, so check important answers yourself.",
    hints: [
      "For each source, ask: who runs it, and do experts check its work before it's published?",
      "Space agencies, peer-reviewed journals and archives about real scientists tend to be credible. Blogs, fan podcasts and click-driven magazines usually aren't checked by experts.",
      "Four of the sources are credible and three are not.",
    ],
  },
  "text-entry": {
    theme: "blue",
    icon: "📝",
    conceptTitle: "Prompt precision matters",
    conceptBody: "A clear, specific prompt gives an AI the right instructions. Structure is a good starting point, but prompting is a conversation: check the answer, then refine your prompt.",
    hints: [
      "Read Glitch's error message carefully. It points at the one slot causing the biggest problem.",
      "Pick cards that fit this exact emergency: the specific problem, the specific job, and the exact format the ship needs.",
      "Skip cards that are vague (\"somehow\", \"best practices\") or that ask for creativity, jokes, chatty explanations or a loose format.",
    ],
  },
  slider: {
    theme: "green",
    icon: "✅",
    conceptTitle: "Separate facts from fiction",
    conceptBody: "AI can sound sure of itself and still be wrong. Knowing what AI can and can't do helps you decide when to trust it and when to double-check.",
    hints: [
      "Think about what AI really does: it finds patterns in the data it learned from.",
      "AI can be wrong while sounding confident, can invent sources, and can pick up unfair patterns from its data.",
      "Exactly four statements are facts and four are fiction.",
    ],
  },
  keypad: {
    theme: "red",
    icon: "🔐",
    conceptTitle: "Clues become a code",
    conceptBody: "The door code is hidden in puzzle clues. Use what you learned to find the final sequence and unlock the lab.",
    hints: [
      "Each digit puzzle gave you a colored digit. They're listed on the keypad as you earn them.",
      "Your team handout shows the color order. Enter the digits in that order.",
      "Still stuck? Ask your facilitator to check your color order.",
    ],
  },
};

export default function PuzzlePage({ params }: { params: { id: string } }) {
  const [hydrated, setHydrated] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const { solved, codeDigits, finishRun } = useProgress();
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
  const clue = clueFor(puzzle.id);

  // Post-solve congratulations screen: "Your Reward is …" (item 14c/14d).
  if (showReward && puzzle.kind !== "keypad") {
    return (
      <PuzzleShell theme={shellConfig.theme} title={puzzle.title} icon={shellConfig.icon} hints={shellConfig.hints}>
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
                    {codeDigits[clue.puzzleId]}
                  </span>
                  <span className={`font-display text-2xl font-bold ${clue.text}`}>
                    {clue.color} {codeDigits[clue.puzzleId]}
                  </span>
                </div>
              ) : (
                <p className="font-display text-3xl font-bold text-emerald-700">
                  🔑 Keypad key collected
                </p>
              )}
              <p className="text-sm text-slate-500">
                {clue
                  ? "Remember the color: your handout shows where it goes in the door code."
                  : unmetDeps("p5-final-console", solved).length === 0
                    ? "The keypad next to the door is now active. Time to crack the code!"
                    : "One step closer! The keypad by the door switches on once all four puzzles are solved."}
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
    <PuzzleShell theme={shellConfig.theme} title={puzzle.title} icon={shellConfig.icon} hints={shellConfig.hints}>
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
