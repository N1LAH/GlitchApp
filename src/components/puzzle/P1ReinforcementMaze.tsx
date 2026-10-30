"use client";

import { useState, useEffect, useRef } from "react";
import mazeData from "./p1-maze.json";
import {
  type Maze,
  type NodeId,
  type Memory,
  atGoal,
  candidatesFrom,
  directionTo,
  distancesToGoal,
  edgeKey,
  isDeadEndNode,
  isGoodMove,
  nextChoice,
  updateMemory,
} from "./p1-rl";
import { useProgress } from "@/store/progress";
import GlitchSpeech from "@/components/GlitchSpeech";

const maze = mazeData as Maze;
const DIST = distancesToGoal(maze);

const MOVE_DURATION_MS = 800;

const ARROWS = { up: "⬆️", down: "⬇️", left: "⬅️", right: "➡️" } as const;

/**
 * waiting  — at the Lab, Start Run enabled.
 * moving   — Glitch is walking (animation in progress).
 * rating   — Glitch just made a choice; the player rates it 👍 / 👎.
 * dead_end — Glitch hit a dead end; only 👎 is allowed, then it returns to the Lab.
 * done     — reached the Bridge.
 */
type Phase = "waiting" | "moving" | "rating" | "dead_end" | "done";
type Coach = { right: boolean; text: string } | null;

const roomName = (id: NodeId) => maze.nodes[id]?.name;

function describeMove(from: NodeId, to: NodeId) {
  const dir = directionTo(from, to, maze);
  const where = roomName(to) ? `to the ${roomName(to)}` : "into a hallway";
  return `${ARROWS[dir]} ${dir} ${where}`;
}

interface Props {
  onSolved: () => void;
}

export default function P1ReinforcementMaze({ onSolved }: Props) {
  const [current, setCurrent] = useState<NodeId>(maze.start);
  const [phase, setPhase] = useState<Phase>("waiting");
  const [teleport, setTeleport] = useState(false);
  const [status, setStatus] = useState(
    "I'm in the Lab and I need to reach the Bridge 🏁. I'll make a move, then you tell me if it was a good one. Press Start Run!"
  );
  const [coach, setCoach] = useState<Coach>(null);
  const [calls, setCalls] = useState({ right: 0, wrong: 0 });
  const { p1FirstRunCompleted, markP1FirstRunCompleted } = useProgress();

  // Mutable game state read inside timer callbacks (state would be stale there).
  const memoryRef = useRef<Memory>({});
  const trailRef = useRef<NodeId[]>([maze.start]);
  const lastMoveRef = useRef<{ from: NodeId; to: NodeId } | null>(null);
  const firstRunDoneRef = useRef(p1FirstRunCompleted);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    firstRunDoneRef.current = firstRunDoneRef.current || p1FirstRunCompleted;
  }, [p1FirstRunCompleted]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((t) => window.clearTimeout(t));
  }, []);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  /** Glitch picks its next step from `node` and walks it. Forced corridors don't need rating. */
  const step = (node: NodeId) => {
    const trail = trailRef.current;
    const prev = trail.length > 1 ? trail[trail.length - 2] : undefined;
    const options = candidatesFrom(node, prev, maze);
    const forceFailure = !firstRunDoneRef.current && node === maze.start;
    const { next } = nextChoice(node, prev, maze, memoryRef.current, forceFailure);
    const wasChoice = options.length > 1;

    setTeleport(false);
    setPhase("moving");
    setCurrent(next);
    later(() => arrive(node, next, wasChoice), MOVE_DURATION_MS);
  };

  const arrive = (from: NodeId, to: NodeId, wasChoice: boolean) => {
    trailRef.current = [...trailRef.current, to];

    if (atGoal(to, maze)) {
      setPhase("done");
      setStatus("I made it to the Bridge! Thanks for training me!");
      onSolved();
      return;
    }

    if (isDeadEndNode(to, maze)) {
      lastMoveRef.current = { from, to };
      setPhase("dead_end");
      setStatus(`I went ${describeMove(from, to)}… and hit a dead end! Tell me that was a bad move.`);
      return;
    }

    if (!wasChoice) {
      step(to);
      return;
    }

    lastMoveRef.current = { from, to };
    setPhase("rating");
    setStatus(`I went ${describeMove(from, to)}. Was that a good move?`);
  };

  const returnToLab = (message: string) => {
    clearTimers();
    trailRef.current = [maze.start];
    lastMoveRef.current = null;
    setTeleport(true);
    setCurrent(maze.start);
    setPhase("waiting");
    setStatus(message);
  };

  const handleStartRun = () => {
    if (phase !== "waiting") return;
    setCoach(null);
    step(maze.start);
  };

  const handleStartOver = () => {
    setCoach(null);
    returnToLab("Back at the Lab — I'll try to remember your feedback. Press Start Run to try again!");
  };

  const handleFeedback = (label: "good" | "bad") => {
    const move = lastMoveRef.current;
    if (!move || (phase !== "rating" && phase !== "dead_end")) return;
    if (phase === "dead_end" && label === "good") return;

    const actuallyGood = isGoodMove(move.from, move.to, maze, DIST);
    const rightCall = actuallyGood === (label === "good");
    setCalls((c) => ({
      right: c.right + (rightCall ? 1 : 0),
      wrong: c.wrong + (rightCall ? 0 : 1),
    }));
    setCoach({
      right: rightCall,
      text: phase === "dead_end"
        ? "Right — a dead end is always a bad move. Glitch will try to avoid it next time."
        : rightCall
          ? actuallyGood
            ? "Good call — that move got Glitch closer to the Bridge."
            : "Good call — that move took Glitch the wrong way."
          : label === "good"
            ? "Hmm — that move took Glitch the long way around. Rewarding it teaches Glitch a slower route."
            : "Actually, that move was on the shortest route to the Bridge. Penalizing good moves teaches Glitch to avoid the right path!",
    });

    memoryRef.current = updateMemory(
      memoryRef.current,
      edgeKey(move.from, move.to),
      label === "good" ? "correct" : "incorrect"
    );
    lastMoveRef.current = null;

    if (phase === "dead_end") {
      if (!firstRunDoneRef.current) {
        firstRunDoneRef.current = true;
        markP1FirstRunCompleted();
      }
      returnToLab("Back to the Lab. I will try to remember that next time — press Start Run to try again!");
      return;
    }

    step(move.to);
  };

  const spriteNode = maze.nodes[current];
  const goalNode = maze.nodes[maze.goal];
  const rating = phase === "rating";
  const deadEnd = phase === "dead_end";

  return (
    <div className="space-y-2">
      <div className="relative mx-auto h-[52vh] max-h-[540px] aspect-square overflow-hidden rounded-2xl border-2 border-purple-200 shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/images/maze/Ship_Maze.webp"
          alt="Map of the ship: Bridge, Cafe and Gym along the top; Airlock, Crew Quarters and Rec Room in the middle; Engineering, Medical and Lab along the bottom"
          className="absolute inset-0 h-full w-full object-cover select-none pointer-events-none"
        />

        <span
          className="absolute rounded-full border-2 border-white bg-amber-400 px-2 py-0.5 text-xs font-bold text-slate-900 shadow-lg"
          style={{ left: `${goalNode.x}%`, top: `${goalNode.y - 11}%`, transform: "translate(-50%, -50%)", zIndex: 11 }}
        >
          🏁 Goal
        </span>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/images/maze/glitch.webp"
          alt="Glitch"
          className={`absolute ease-in-out ${teleport ? "" : "transition-all duration-[800ms]"}`}
          style={{
            left: `${spriteNode.x}%`,
            top: `${spriteNode.y}%`,
            transform: "translate(-50%, -50%)",
            width: "5.625%",
            imageRendering: "pixelated",
            zIndex: 10,
          }}
        />
      </div>

      <div role="status" aria-live="polite">
        <GlitchSpeech mood={deadEnd ? "worried" : phase === "done" ? "happy" : "neutral"}>
          {status}
        </GlitchSpeech>
      </div>

      {coach && phase !== "done" && (
        <p
          className={`rounded-xl border px-3 py-2 text-sm ${
            coach.right
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-800"
          }`}
        >
          {coach.right ? "✓ " : "✗ "}
          {coach.text}
        </p>
      )}

      {phase === "done" && (
        <div
          className="space-y-1 rounded-2xl border-l-4 border-emerald-400 bg-emerald-50 p-4"
          role="status"
          aria-live="polite"
        >
          <p className="text-sm font-semibold text-emerald-800">
            🎉 You trained Glitch to find the Bridge!
          </p>
          <p className="text-sm text-slate-700">
            You made{" "}
            <span className="font-semibold text-emerald-700">
              {calls.right} right call{calls.right === 1 ? "" : "s"}
            </span>{" "}
            and{" "}
            <span className="font-semibold text-rose-700">
              {calls.wrong} wrong call{calls.wrong === 1 ? "" : "s"}
            </span>
            . Every 👍 and 👎 made Glitch more or less likely to choose that move again. That&apos;s{" "}
            <span className="font-semibold">reinforcement learning</span>: an
            AI improves through trial, error and feedback — and wrong feedback
            teaches it the wrong thing.
          </p>
        </div>
      )}

      <div className="text-sm text-slate-600">
        Your calls: <span className="font-semibold text-emerald-700">✓ {calls.right} right</span>{" "}
        · <span className="font-semibold text-rose-700">✗ {calls.wrong} wrong</span>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleStartRun}
          disabled={phase !== "waiting"}
          className="flex-1 rounded-full bg-puzzle-purple px-4 py-2 font-semibold text-white transition-colors hover:bg-puzzle-purple/90 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 focus:outline-none focus:ring-2 focus:ring-puzzle-purple/50 focus:ring-offset-2"
        >
          Start Run
        </button>
        <button
          onClick={handleStartOver}
          disabled={phase !== "rating" && phase !== "moving"}
          className="flex-1 rounded-full border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2"
        >
          Start Over
        </button>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => handleFeedback("good")}
          disabled={!rating}
          className="flex-1 rounded-full bg-puzzle-green px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-puzzle-green/90 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 focus:outline-none focus:ring-2 focus:ring-puzzle-green/50 focus:ring-offset-2"
        >
          👍 Good move
        </button>
        <button
          onClick={() => handleFeedback("bad")}
          disabled={!rating && !deadEnd}
          className="flex-1 rounded-full bg-puzzle-red px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-puzzle-red/90 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 focus:outline-none focus:ring-2 focus:ring-puzzle-red/50 focus:ring-offset-2"
        >
          👎 Bad move
        </button>
      </div>
    </div>
  );
}
