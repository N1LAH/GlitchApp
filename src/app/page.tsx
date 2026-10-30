"use client";

import { useEffect, useState } from "react";
import Hotspot, { type HotspotState } from "@/components/hotspot";
import GlitchSpeech from "@/components/GlitchSpeech";
import { useProgress } from "@/store/progress";
import { byId, allPuzzles, titleList, unmetDeps } from "@/lib/puzzles";
import { CLUES, clueFor } from "@/lib/clues";
import { useRouter } from "next/navigation";

/**
 * Object hotspots anchored to the lab artwork (1536x1024, rendered in a fixed
 * 3:2 box so percentages always line up with the picture).
 *
 * Placement per Liz's feedback: the maze triggers from the grid panel on the
 * right wall; the Final Console is the small keypad panel next to the door.
 */
const OBJECTS: {
  id: string;
  puzzleId: string;
  x: number;
  y: number;
  width: number;
  height: number;
}[] = [
  { id: "hs-maze", puzzleId: "p1-feedback-maze", x: 90, y: 45, width: 9, height: 15 },
  { id: "hs-printouts", puzzleId: "p2-bad-data", x: 19, y: 74, width: 16, height: 13 },
  { id: "hs-terminal", puzzleId: "p3-prompt-precision", x: 68, y: 47, width: 12, height: 16 },
  { id: "hs-logbook", puzzleId: "p4-fact-fiction", x: 46, y: 53, width: 12, height: 10 },
  { id: "hs-keypad", puzzleId: "p5-final-console", x: 13.5, y: 43.5, width: 4.5, height: 10 },
];

/** Lamp colors for the wall sign: light tints that glow on its dark panel. */
const WALL_LAMP: Record<string, string> = { Green: "#6ee7a0", Blue: "#7cc0ff", Red: "#ff8a80" };

/** Tooltip for a solved puzzle: its name, "Solved", and the reward it granted (color matters!). */
function solvedTooltip(puzzleId: string) {
  const clue = clueFor(puzzleId);
  const reward = clue ? (
    <span className={`text-base font-bold ${clue.text}`}>
      {clue.color} {clue.digit}
    </span>
  ) : puzzleId === "p4-fact-fiction" ? (
    "Keypad activated"
  ) : (
    "Door unlocked"
  );
  return (
    <span>
      <strong>{byId(puzzleId)?.title}</strong>
      <br />
      <span className="text-slate-500">Solved</span>
      <br />
      Reward: {reward}
    </span>
  );
}

export default function Home() {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const { solved, startedAt } = useProgress();

  useEffect(() => {
    setHydrated(true);
  }, []);

  // Fresh session? Send players through the start screen first.
  useEffect(() => {
    if (hydrated && !startedAt) {
      router.replace("/start");
    }
  }, [hydrated, startedAt, router]);

  // Warm up all in-game routes so first clicks resolve fast.
  useEffect(() => {
    allPuzzles.forEach((p) => router.prefetch(`/puzzles/${p.id}`));
    ["/episodes", "/how-to-play", "/end"].forEach((r) => router.prefetch(r));
  }, [router]);

  const stateFor = (puzzleId: string): HotspotState => {
    if (!hydrated) return "available";
    if (solved[puzzleId]) return "solved";
    // Only the keypad is gated: it stays inactive until the other four puzzles are solved.
    return unmetDeps(puzzleId, solved).length > 0 ? "inactive" : "available";
  };

  const tooltipFor = (puzzleId: string, state: HotspotState) => {
    const def = byId(puzzleId);
    if (state === "solved") return solvedTooltip(puzzleId);
    if (state === "inactive") {
      return (
        <span>
          <strong>{def?.title}</strong> — locked. Solve{" "}
          {titleList(unmetDeps(puzzleId, solved))} to switch on the keypad.
        </span>
      );
    }
    return (
      <span>
        <strong>{def?.title}</strong>
        <br />
        {def?.description}
      </span>
    );
  };

  const escaped = hydrated && !!solved["p5-final-console"];
  const solvedCount = hydrated
    ? OBJECTS.filter((o) => solved[o.puzzleId]).length
    : 0;

  const glitchLine = escaped
    ? "The door is open — we did it! Step outside whenever you're ready."
    : solvedCount === 0
      ? "Something scrambled my circuits and locked us in! Click the glowing objects around the lab to help me relearn how AI works."
      : solvedCount >= 4
        ? "All my systems are back online! The keypad next to the door is active. The wall above it shows the color order — enter the code to get us out."
        : `That's ${solvedCount} of my systems back online. Keep investigating the lab!`;

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-glitch-teal to-glitch-teal-deep px-4 py-6 sm:px-8">
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="rounded-[24px] border border-white/20 bg-white/95 px-6 py-4 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">
                🤖 AI Research Laboratory
              </h1>
              <p className="mt-0.5 text-sm text-slate-600">
                Click on objects around the lab to uncover the mysteries of
                artificial intelligence.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => router.push("/episodes")}
                className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
              >
                📋 Mission Log
              </button>
              <button
                onClick={() => router.push("/how-to-play")}
                className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
              >
                ❓ How to Play
              </button>
            </div>
          </div>
          <GlitchSpeech
            className="mt-3"
            mood={escaped ? "happy" : solvedCount === 0 ? "worried" : "neutral"}
          >
            {glitchLine}
          </GlitchSpeech>
        </div>

        {/* Fixed-aspect scene so hotspot percentages always match the artwork */}
        <div className="relative mx-auto aspect-[3/2] w-full max-w-[max(36rem,calc((100vh_-_15rem)_*_1.5))] overflow-hidden rounded-[28px] border-8 border-glitch-teal-deep shadow-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/images/lab-bg.webp"
            alt="The AI research lab"
            className="absolute inset-0 h-full w-full select-none object-cover"
            draggable={false}
          />

          {/* Door-code color order, as a wall-mounted indicator panel above the keypad,
              styled after the keypad panel painted in the artwork. Its own layer is the
              size container (cqw units scale with the artwork) so the containment
              doesn't affect hotspot tooltips. */}
          <div className="pointer-events-none absolute inset-0" style={{ containerType: "inline-size" }}>
            <div
              className="absolute flex -translate-x-1/2 flex-col gap-[0.45cqw] rounded-[0.7cqw] border-[0.22cqw] border-[#8fa7a2] bg-[#263130] px-[0.75cqw] py-[0.6cqw] shadow-[0.35cqw_0.35cqw_0_rgba(20,35,33,0.35)]"
              style={{ left: "13.5%", top: "24.5%" }}
              role="img"
              aria-label={`Door code color order: ${CLUES.map((c) => c.color).join(", ")}`}
            >
              {CLUES.map((c) => (
                <span key={c.color} className="flex items-center gap-[0.5cqw]">
                  <span
                    className="h-[0.95cqw] w-[0.95cqw] rounded-full"
                    style={{ background: WALL_LAMP[c.color], boxShadow: `0 0 0.6cqw ${WALL_LAMP[c.color]}` }}
                  />
                  <span
                    className="font-display text-[1.15cqw] font-semibold uppercase leading-none tracking-[0.08em]"
                    style={{ color: WALL_LAMP[c.color] }}
                  >
                    {c.color}
                  </span>
                </span>
              ))}
            </div>
          </div>

          {OBJECTS.map((o) => {
            const state = stateFor(o.puzzleId);
            return (
              <Hotspot
                key={o.id}
                id={o.id}
                label={byId(o.puzzleId)?.title ?? o.puzzleId}
                x={o.x}
                y={o.y}
                width={o.width}
                height={o.height}
                state={state}
                tooltip={tooltipFor(o.puzzleId, state)}
                onActivate={() => router.push(`/puzzles/${o.puzzleId}`)}
              />
            );
          })}

          {/* The exit only becomes a clickable object once the code is cracked */}
          {escaped && (
            <Hotspot
              id="hs-exit"
              label="Exit"
              x={5}
              y={50}
              width={9}
              height={46}
              state="available"
              tooltip={<span>🚪 The door is open — step outside!</span>}
              onActivate={() => router.push("/end")}
            />
          )}
        </div>

        <p className="text-center text-sm text-glitch-cream/80">
          Tab to move between objects, Enter to activate.
        </p>
      </div>
    </div>
  );
}
