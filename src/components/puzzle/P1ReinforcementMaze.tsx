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

const DECISION_PAUSE_MS = 700;
const MOVE_DURATION_MS = 800;
const DEAD_END_PAUSE_MS = 1600;

const ARROWS = { up: "⬆️", down: "⬇️", left: "⬅️", right: "➡️" } as const;

type Phase = "waiting" | "proposing" | "moving" | "dead_end" | "done";
type Coach = { right: boolean; text: string } | null;

const roomName = (id: NodeId) => maze.nodes[id]?.name;
const placeName = (id: NodeId) => (roomName(id) ? `the ${roomName(id)}` : "the hallway");

interface Props {
  onSolved: () => void;
}

export default function P1ReinforcementMaze({ onSolved }: Props) {
  const [current, setCurrent] = useState<NodeId>(maze.start);
  const [sprite, setSprite] = useState<NodeId>(maze.start);
  const [proposal, setProposal] = useState<NodeId | null>(null);
  const [phase, setPhase] = useState<Phase>("waiting");
  const [status, setStatus] = useState(
    "I'm in the Lab and I need to reach the Bridge 🏁. I'll suggest each move — you tell me if it's a good one!"
  );
  const [coach, setCoach] = useState<Coach>(null);
  const [calls, setCalls] = useState({ right: 0, wrong: 0 });
  const { p1FirstRunCompleted, markP1FirstRunCompleted } = useProgress();

  // Mutable game state read inside timer callbacks (state would be stale there).
  const memoryRef = useRef<Memory>({});
  const trailRef = useRef<NodeId[]>([maze.start]);
  const rejectedRef = useRef<NodeId[]>([]);
  const firstProposalDoneRef = useRef(p1FirstRunCompleted);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    firstProposalDoneRef.current = firstProposalDoneRef.current || p1FirstRunCompleted;
  }, [p1FirstRunCompleted]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((t) => window.clearTimeout(t));
  }, []);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  const prevOf = () => {
    const trail = trailRef.current;
    return trail.length > 1 ? trail[trail.length - 2] : undefined;
  };

  const proposeAt = (node: NodeId) => {
    const prev = prevOf();
    const options = candidatesFrom(node, prev, maze);
    const forceFailure = !firstProposalDoneRef.current && node === maze.start;
    const { next } = nextChoice(node, prev, maze, memoryRef.current, forceFailure, rejectedRef.current);

    if (options.length === 1) {
      moveTo(next);
      return;
    }

    const dir = directionTo(node, next, maze);
    const toward = roomName(next) ? `, to ${placeName(next)}` : "";
    setProposal(next);
    setPhase("proposing");
    setStatus(
      `I'm in ${roomName(node) ? placeName(node) : "a hallway"}. I want to go ${ARROWS[dir]} ${dir}${toward}. Is that a good move?`
    );
  };

  const moveTo = (next: NodeId) => {
    setPhase("moving");
    setProposal(null);
    setSprite(next);
    later(() => arrive(next), MOVE_DURATION_MS);
  };

  const arrive = (node: NodeId) => {
    const from = trailRef.current[trailRef.current.length - 1];
    trailRef.current = [...trailRef.current, node];
    rejectedRef.current = [];
    setCurrent(node);

    if (atGoal(node, maze)) {
      setPhase("done");
      setStatus("I made it to the Bridge! Thanks for training me!");
      onSolved();
      return;
    }

    if (isDeadEndNode(node, maze)) {
      // The maze itself gives feedback too: a dead end is always a penalty.
      memoryRef.current = updateMemory(memoryRef.current, edgeKey(from, node), "incorrect");
      setPhase("dead_end");
      setStatus(
        `Dead end! I'll remember that this way doesn't work. Heading back to ${placeName(from)}…`
      );
      later(() => {
        trailRef.current = trailRef.current.slice(0, -1);
        setSprite(from);
        later(() => {
          setCurrent(from);
          proposeAt(from);
        }, MOVE_DURATION_MS);
      }, DEAD_END_PAUSE_MS);
      return;
    }

    proposeAt(node);
  };

  const handleStartRun = () => {
    if (phase !== "waiting") return;
    proposeAt(current);
  };

  const handleStartOver = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    trailRef.current = [maze.start];
    rejectedRef.current = [];
    setCurrent(maze.start);
    setSprite(maze.start);
    setProposal(null);
    setCoach(null);
    setPhase("waiting");
    setStatus("Back at the Lab — I still remember your feedback. Click 'Start Run' to try again!");
  };

  const handleFeedback = (label: "good" | "bad") => {
    if (phase !== "proposing" || !proposal) return;
    const from = current;
    const to = proposal;
    const actuallyGood = isGoodMove(from, to, maze, DIST);
    const rightCall = actuallyGood === (label === "good");

    setCalls((c) => ({
      right: c.right + (rightCall ? 1 : 0),
      wrong: c.wrong + (rightCall ? 0 : 1),
    }));
    setCoach({
      right: rightCall,
      text: rightCall
        ? actuallyGood
          ? "Good call — that move gets Glitch closer to the Bridge."
          : "Good call — that move would have taken Glitch the wrong way."
        : label === "good"
          ? isDeadEndNode(to, maze)
            ? "Careful — that path is a dead end. Rewarding it teaches Glitch a bad habit."
            : "Hmm — that move takes Glitch the long way around. Rewarding it teaches Glitch a slower route."
          : "Actually, that move was on the shortest route to the Bridge. Penalizing good moves teaches Glitch to avoid the right path!",
    });

    memoryRef.current = updateMemory(
      memoryRef.current,
      edgeKey(from, to),
      label === "good" ? "correct" : "incorrect"
    );

    if (!firstProposalDoneRef.current) {
      firstProposalDoneRef.current = true;
      markP1FirstRunCompleted();
    }

    if (label === "good") {
      moveTo(to);
    } else {
      rejectedRef.current = [...rejectedRef.current, to];
      setProposal(null);
      setPhase("moving");
      setStatus("Okay, I won't go that way. Let me think again…");
      later(() => proposeAt(from), DECISION_PAUSE_MS);
    }
  };

  const spriteNode = maze.nodes[sprite];
  const goalNode = maze.nodes[maze.goal];
  const proposalNode = proposal ? maze.nodes[proposal] : null;
  const canStartRun = phase === "waiting";
  const deciding = phase === "proposing";

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

        {proposalNode && (
          <span
            aria-hidden
            className="absolute h-[9%] w-[9%] animate-pulse rounded-full border-4 border-amber-300 bg-amber-300/30 shadow-[0_0_16px_rgba(252,211,77,0.9)]"
            style={{ left: `${proposalNode.x}%`, top: `${proposalNode.y}%`, transform: "translate(-50%, -50%)", zIndex: 9 }}
          />
        )}

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/images/maze/glitch.webp"
          alt="Glitch"
          className="absolute transition-all duration-[800ms] ease-in-out"
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
        <GlitchSpeech
          mood={phase === "dead_end" ? "worried" : phase === "done" ? "happy" : "neutral"}
        >
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
            . Every 👍 and 👎 changed which way Glitch chose next. That&apos;s{" "}
            <span className="font-semibold">reinforcement learning</span>: an
            AI improves through trial, error and feedback — and wrong feedback
            teaches it the wrong thing.
          </p>
        </div>
      )}

      <div className="flex items-center justify-between gap-2 text-sm text-slate-600">
        <span>
          Your calls: <span className="font-semibold text-emerald-700">✓ {calls.right} right</span>{" "}
          · <span className="font-semibold text-rose-700">✗ {calls.wrong} wrong</span>
        </span>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleStartRun}
          disabled={!canStartRun}
          className="flex-1 rounded-full bg-puzzle-purple px-4 py-2 font-semibold text-white transition-colors hover:bg-puzzle-purple/90 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 focus:outline-none focus:ring-2 focus:ring-puzzle-purple/50 focus:ring-offset-2"
        >
          Start Run
        </button>
        <button
          onClick={handleStartOver}
          disabled={canStartRun || phase === "done"}
          className="flex-1 rounded-full border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2"
        >
          Start Over
        </button>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => handleFeedback("good")}
          disabled={!deciding}
          className="flex-1 rounded-full bg-puzzle-green px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-puzzle-green/90 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 focus:outline-none focus:ring-2 focus:ring-puzzle-green/50 focus:ring-offset-2"
        >
          👍 Good move
        </button>
        <button
          onClick={() => handleFeedback("bad")}
          disabled={!deciding}
          className="flex-1 rounded-full bg-puzzle-red px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-puzzle-red/90 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 focus:outline-none focus:ring-2 focus:ring-puzzle-red/50 focus:ring-offset-2"
        >
          👎 Bad move
        </button>
      </div>
    </div>
  );
}
