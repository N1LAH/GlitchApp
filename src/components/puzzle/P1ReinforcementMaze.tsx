"use client";

import { useState, useEffect, useRef } from "react";
import mazeData from "./p1-maze.json";
import {
  type Maze,
  type NodeId,
  type Memory,
  atGoal,
  isDeadEndNode,
  shouldStop,
  nextChoice,
  updateMemory,
} from "./p1-rl";
import { useProgress } from "@/store/progress";
import GlitchSpeech from "@/components/GlitchSpeech";

const maze = mazeData as Maze;

const DECISION_PAUSE_MS = 600;
const MOVE_DURATION_MS = 800;

type Phase = "waiting" | "stopped" | "deciding" | "moving" | "dead_end";

interface Props {
  onSolved: () => void;
}

export default function P1ReinforcementMaze({ onSolved }: Props) {
  const [current, setCurrent] = useState<NodeId>(maze.start);
  const [prev, setPrev] = useState<NodeId | undefined>(undefined);
  const [lastEdge, setLastEdge] = useState<string | null>(null);
  const [memory, setMemory] = useState<Memory>({});
  const [phase, setPhase] = useState<Phase>("waiting");
  const [status, setStatus] = useState<string>("Glitch is waiting at the Lab. Click 'Start Run' to begin!");
  const [nextNode, setNextNode] = useState<NodeId | null>(null);
  const [feedback, setFeedback] = useState({ correct: 0, incorrect: 0 });
  const [reachedGoal, setReachedGoal] = useState(false);
  const solvedRef = useRef(false);
  const { p1FirstRunCompleted, markP1FirstRunCompleted } = useProgress();

  const handleStartRun = () => {
    if (phase === "waiting") {
      setStatus("Starting run from Lab...");
      setPhase("stopped");
    }
  };

  const handleStartOver = () => {
    setCurrent(maze.start);
    setPrev(undefined);
    setNextNode(null);
    setLastEdge(null);
    setStatus("Back at Lab. Click 'Start Run' to try again!");
    setPhase("waiting");
  };

  useEffect(() => {
    if (phase === "waiting") {
      return;
    }

    if (atGoal(current, maze) && !solvedRef.current) {
      solvedRef.current = true;
      setReachedGoal(true);
      setStatus("Goal reached! You've arrived at the Bridge!");
      onSolved();
      return;
    }

    if (phase === "stopped") {
      const forceFailure = !p1FirstRunCompleted && current === maze.start;
      const { next, choiceEdge } = nextChoice(current, prev, maze, memory, forceFailure);
      setLastEdge(choiceEdge);
      setNextNode(next);
      
      if (current === maze.start && prev === undefined) {
        setStatus("Starting from Lab...");
        setPhase("moving");
        return;
      }
      
      setStatus(`At ${current}. Choose Correct or Incorrect to continue.`);
    }

    if (phase === "moving" && nextNode) {
      const timer = setTimeout(() => {
        setPrev(current);
        setCurrent(nextNode);
        setNextNode(null);

        if (isDeadEndNode(nextNode, maze)) {
          if (!p1FirstRunCompleted) {
            markP1FirstRunCompleted();
          }
          setStatus(`Dead end at ${nextNode}! Choose Correct or Incorrect before returning.`);
          setPhase("dead_end");
        } else {
          setPhase("stopped");
        }
      }, MOVE_DURATION_MS);
      return () => clearTimeout(timer);
    }
  }, [phase, current, prev, nextNode, memory, onSolved]);

  const handleFeedback = (label: "correct" | "incorrect") => {
    if (lastEdge && (phase === "stopped" || phase === "dead_end")) {
      setFeedback((f) => ({
        correct: f.correct + (label === "correct" ? 1 : 0),
        incorrect: f.incorrect + (label === "incorrect" ? 1 : 0),
      }));
    }
    if (lastEdge && phase === "stopped") {
      setMemory(updateMemory(memory, lastEdge, label));
      setStatus(`Marked as ${label}. Moving to next node...`);
      setPhase("moving");
    }
    if (lastEdge && phase === "dead_end") {
      setMemory(updateMemory(memory, lastEdge, label));
      setStatus(`Marked as ${label}. Returning to Lab...`);
      setTimeout(() => {
        setCurrent(maze.start);
        setPrev(undefined);
        setLastEdge(null);
        setStatus("Back at Lab. Click 'Start Run' to try again!");
        setPhase("waiting");
      }, DECISION_PAUSE_MS);
    }
  };

  const currentNode = maze.nodes[current];
  const targetNode = nextNode && phase === "moving" ? maze.nodes[nextNode] : currentNode;
  const spriteX = targetNode?.x ?? 50;
  const spriteY = targetNode?.y ?? 50;

  const canStartRun = phase === "waiting";

  return (
    <div className="space-y-2">
      <div className="relative mx-auto h-[52vh] max-h-[540px] aspect-square overflow-hidden rounded-2xl border-2 border-purple-200 shadow-sm">
        <img
          src="/assets/images/maze/Ship_Maze.webp"
          alt="Ship maze"
          className="absolute inset-0 h-full w-full object-cover select-none pointer-events-none"
        />

        <img
          src="/assets/images/maze/glitch.webp"
          alt="Glitch character"
          className="absolute transition-all duration-[800ms] ease-in-out"
          style={{
            left: `${spriteX}%`,
            top: `${spriteY}%`,
            transform: "translate(-50%, -50%)",
            width: "5.625%",
            imageRendering: "pixelated",
            zIndex: 10,
          } as React.CSSProperties & { imageRendering: string }}
        />
      </div>

      <div role="status" aria-live="polite">
        <GlitchSpeech
          mood={
            phase === "dead_end" ? "worried" : reachedGoal ? "happy" : "neutral"
          }
        >
          {status}
        </GlitchSpeech>
      </div>

      {reachedGoal && (
        <div
          className="space-y-1 rounded-2xl border-l-4 border-emerald-400 bg-emerald-50 p-4"
          role="status"
          aria-live="polite"
        >
          <p className="text-sm font-semibold text-emerald-800">
            🎉 You helped Glitch learn the way to the Bridge!
          </p>
          <p className="text-sm text-slate-700">
            You rewarded{" "}
            <span className="font-semibold text-emerald-700">
              {feedback.correct} good move{feedback.correct === 1 ? "" : "s"}
            </span>{" "}
            and flagged{" "}
            <span className="font-semibold text-rose-700">
              {feedback.incorrect} wrong turn{feedback.incorrect === 1 ? "" : "s"}
            </span>
            . That&apos;s <span className="font-semibold">reinforcement learning</span>:
            an AI gets better by trial and error, using your rewards and penalties
            to figure out which choices lead to the goal.
          </p>
        </div>
      )}

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
          disabled={canStartRun || atGoal(current, maze)}
          className="flex-1 rounded-full border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2"
        >
          Start Over
        </button>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => handleFeedback("correct")}
          disabled={(phase !== "stopped" && phase !== "dead_end") || atGoal(current, maze)}
          className="flex-1 rounded-full bg-puzzle-green px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-puzzle-green/90 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 focus:outline-none focus:ring-2 focus:ring-puzzle-green/50 focus:ring-offset-2"
        >
          👍 Correct Decision
        </button>
        <button
          onClick={() => handleFeedback("incorrect")}
          disabled={(phase !== "stopped" && phase !== "dead_end") || atGoal(current, maze)}
          className="flex-1 rounded-full bg-puzzle-red px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-puzzle-red/90 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 focus:outline-none focus:ring-2 focus:ring-puzzle-red/50 focus:ring-offset-2"
        >
          👎 Incorrect Decision
        </button>
      </div>
    </div>
  );
}
