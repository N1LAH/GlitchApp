"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useProgress } from "@/store/progress";
import GlitchSpeech from "@/components/GlitchSpeech";

const STORAGE_KEY = "glitch_p4_v1";
const PUZZLE_ID = "p4-fact-fiction";

export interface Statement {
  id: string;
  text: string;
  answer: "Fact" | "Fiction";
  correctedText?: string;
}

export const STATEMENTS: Statement[] = [
  { id: "s1", text: "AI stands for Artificial Imagination.", answer: "Fiction", correctedText: "AI stands for Artificial Intelligence." },
  { id: "s2", text: "AI learns from patterns in data.", answer: "Fact" },
  { id: "s3", text: "AI can always be trusted to give the right answer.", answer: "Fiction", correctedText: "AI can sometimes give incorrect answers." },
  { id: "s4", text: "AI Assistants like Glitch are examples of AI.", answer: "Fact" },
  { id: "s5", text: "AI never makes mistakes.", answer: "Fiction", correctedText: "AI systems can make mistakes." },
  { id: "s6", text: "AI can be trained with rewards and penalties, like teaching a pet.", answer: "Fact" },
  { id: "s7", text: "AI models always know what words mean.", answer: "Fiction", correctedText: "AI models detect patterns in words but do not truly understand meaning." },
  { id: "s8", text: "AI can generate text, images, and even music.", answer: "Fact" },
];

type Column = "Fact" | "Fiction";
type CheckPhase = "idle" | "failed" | "success";

interface SavedState {
  assignments: Record<string, Column | null>;
  checkPhase: CheckPhase;
  score: number;
}

function loadState(): SavedState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedState) : null;
  } catch {
    return null;
  }
}

function saveState(state: SavedState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function scoreAssignments(assignments: Record<string, Column | null>): number {
  return STATEMENTS.reduce((count, s) => (assignments[s.id] === s.answer ? count + 1 : count), 0);
}

interface Props {
  onSolved: () => void;
  solved: boolean;
}

export default function P4FactFiction({ onSolved, solved }: Props) {
  const [assignments, setAssignments] = useState<Record<string, Column | null>>(() =>
    Object.fromEntries(STATEMENTS.map((s) => [s.id, null]))
  );
  const [checkPhase, setCheckPhase] = useState<CheckPhase>("idle");
  const [score, setScore] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const liveRef = useRef<HTMLDivElement>(null);

  const allAssigned = STATEMENTS.every((s) => assignments[s.id] !== null);
  const isLocked = checkPhase === "success" || checkPhase === "failed";

  const announce = useCallback((msg: string) => {
    if (liveRef.current) liveRef.current.textContent = msg;
  }, []);

  // Restore saved state after mount (not during render) so SSR and client markup match.
  useEffect(() => {
    const solvedInStore = solved || !!useProgress.getState().solved[PUZZLE_ID];
    const saved = loadState();
    if (saved) {
      if (saved.checkPhase === "success" && !solvedInStore) {
        // Global progress was reset but this puzzle's own storage wasn't — start fresh.
        localStorage.removeItem(STORAGE_KEY);
      } else {
        setAssignments(saved.assignments);
        setCheckPhase(saved.checkPhase);
        setScore(saved.score);
      }
    } else if (solvedInStore) {
      setAssignments(Object.fromEntries(STATEMENTS.map((s) => [s.id, s.answer])));
      setCheckPhase("success");
      setScore(STATEMENTS.length);
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (checkPhase !== "success") {
      saveState({ assignments, checkPhase, score });
    }
  }, [hydrated, assignments, checkPhase, score]);

  const assignCard = useCallback(
    (id: string, column: Column) => {
      if (isLocked) return;
      setAssignments((prev) => ({ ...prev, [id]: column }));
      setSelectedId(null);
      announce(`Moved to ${column}.`);
    },
    [isLocked, announce]
  );

  const returnToUnassigned = useCallback(
    (id: string) => {
      if (isLocked) return;
      setAssignments((prev) => ({ ...prev, [id]: null }));
      setSelectedId(null);
      announce("Returned to unassigned.");
    },
    [isLocked, announce]
  );

  const handleDragStart = useCallback(
    (e: React.DragEvent, id: string) => {
      if (isLocked) return;
      e.dataTransfer.setData("text/plain", id);
      e.dataTransfer.effectAllowed = "move";
    },
    [isLocked]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, target: Column | "unassigned") => {
      e.preventDefault();
      const id = e.dataTransfer.getData("text/plain");
      if (!id) return;
      if (target === "unassigned") {
        returnToUnassigned(id);
      } else {
        assignCard(id, target);
      }
    },
    [assignCard, returnToUnassigned]
  );

  const handleCheckAnswers = useCallback(() => {
    if (!allAssigned || checking || isLocked) return;
    setChecking(true);
    const s = scoreAssignments(assignments);
    setScore(s);
    if (s === 8) {
      setCheckPhase("success");
      saveState({ assignments, checkPhase: "success", score: s });
      onSolved();
    } else {
      setCheckPhase("failed");
      saveState({ assignments, checkPhase: "failed", score: s });
    }
    setChecking(false);
  }, [allAssigned, checking, isLocked, assignments, onSolved]);

  const handleReset = useCallback(() => {
    const fresh = Object.fromEntries(STATEMENTS.map((s) => [s.id, null]));
    setAssignments(fresh as Record<string, Column | null>);
    setCheckPhase("idle");
    setScore(0);
    setSelectedId(null);
    saveState({ assignments: fresh as Record<string, Column | null>, checkPhase: "idle", score: 0 });
    announce("Puzzle reset. All cards returned to unassigned.");
  }, [announce]);

  const unassigned = STATEMENTS.filter((s) => assignments[s.id] === null);
  const factCards = STATEMENTS.filter((s) => assignments[s.id] === "Fact");
  const fictionCards = STATEMENTS.filter((s) => assignments[s.id] === "Fiction");

  const cardClass = (id: string) =>
    `px-3 py-2 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-puzzle-green/60 ${
      isLocked
        ? "cursor-default border-slate-200 bg-white text-slate-600"
        : selectedId === id
        ? "cursor-pointer border-puzzle-green bg-emerald-100 text-slate-900"
        : "cursor-grab active:cursor-grabbing border-slate-300 bg-white text-slate-700 shadow-sm hover:border-puzzle-green/60"
    }`;

  const renderCard = (s: Statement, inColumn?: Column) => {
    const isSelected = selectedId === s.id;
    return (
      <div
        key={s.id}
        draggable={!isLocked}
        onDragStart={(e) => handleDragStart(e, s.id)}
        tabIndex={isLocked ? -1 : 0}
        role="button"
        aria-label={`${s.text}${isSelected ? " (selected)" : ""}`}
        aria-pressed={isSelected}
        className={cardClass(s.id)}
        onClick={() => {
          if (isLocked) return;
          if (selectedId === s.id) {
            setSelectedId(null);
          } else {
            setSelectedId(s.id);
          }
        }}
        onKeyDown={(e) => {
          if (isLocked) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setSelectedId(selectedId === s.id ? null : s.id);
          }
          if (e.key === "f" || e.key === "F") { e.preventDefault(); assignCard(s.id, "Fact"); }
          if (e.key === "n" || e.key === "N") { e.preventDefault(); assignCard(s.id, "Fiction"); }
          if (e.key === "u" || e.key === "U") { e.preventDefault(); returnToUnassigned(s.id); }
        }}
        onFocus={() => { if (!isLocked) setSelectedId(s.id); }}
        onBlur={() => setSelectedId((prev) => (prev === s.id ? null : prev))}
      >
        {checkPhase === "success" && inColumn === "Fiction" && s.answer === "Fiction" ? (
          <div className="space-y-1">
            <p>{s.text}</p>
            <span className="inline-block text-xs font-semibold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
              Corrected
            </span>
            <p className="text-emerald-700 text-xs">Corrected: {s.correctedText}</p>
          </div>
        ) : (
          s.text
        )}
      </div>
    );
  };

  const columnDropZone = (col: Column | "unassigned", label: string, cards: Statement[], accent: string) => (
    <div
      className={`rounded-2xl border-2 border-dashed p-3 min-h-[80px] transition-colors ${accent}`}
      onDragOver={handleDragOver}
      onDrop={(e) => handleDrop(e, col)}
      role="region"
      aria-label={`${label} drop zone`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</span>
        {!isLocked && selectedId && assignments[selectedId] !== col && (
          <button
            onClick={() => col === "unassigned" ? returnToUnassigned(selectedId) : assignCard(selectedId, col as Column)}
            className="text-xs px-2 py-0.5 rounded-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-puzzle-green/60"
          >
            Place here
          </button>
        )}
      </div>
      <div className="space-y-2">
        {cards.length === 0 && (
          <p className="text-xs text-slate-500 italic">Drop cards here</p>
        )}
        {cards.map((s) => renderCard(s, col === "unassigned" ? undefined : col as Column))}
      </div>
    </div>
  );

  return (
    <div className="space-y-4 text-slate-800">
      <div ref={liveRef} aria-live="assertive" aria-atomic="true" className="sr-only" />

      <GlitchSpeech mood="worried">
        My training data got scrambled — I can&apos;t tell which of these
        statements about AI are true anymore! Sort them for me and I&apos;ll
        activate the keypad.
      </GlitchSpeech>

      <p className="text-sm text-slate-600">
        Drag each statement to the correct column.
      </p>
      <p className="text-xs text-slate-500">
        Keyboard shortcut: Select a card, then press <kbd className="px-1 py-0.5 rounded bg-slate-200 text-slate-700 text-xs">F</kbd> for Fact, <kbd className="px-1 py-0.5 rounded bg-slate-200 text-slate-700 text-xs">N</kbd> for Fiction, <kbd className="px-1 py-0.5 rounded bg-slate-200 text-slate-700 text-xs">U</kbd> to return to Unassigned.
      </p>

      {columnDropZone("unassigned", "Unassigned", unassigned, "border-slate-300 bg-slate-50")}

      <div className="grid grid-cols-2 gap-3">
        {columnDropZone("Fact", "✅ Fact", factCards, "border-puzzle-green/50 bg-emerald-50")}
        {columnDropZone("Fiction", "❌ Fiction", fictionCards, "border-puzzle-red/50 bg-rose-50")}
      </div>

      {checkPhase === "idle" && (
        <button
          onClick={handleCheckAnswers}
          disabled={!allAssigned || checking}
          className="w-full rounded-full bg-puzzle-green px-4 py-2 font-semibold text-white transition-colors hover:bg-puzzle-green/90 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 focus:outline-none focus:ring-2 focus:ring-puzzle-green/50 focus:ring-offset-2"
        >
          Check Answers →
        </button>
      )}

      {checkPhase === "failed" && (
        <>
          <div role="alert">
            <GlitchSpeech mood="worried">
              You correctly identified {score} of 8 statements — my circuits
              are still fuzzy. Reset and try again!
            </GlitchSpeech>
          </div>
          <button
            onClick={handleReset}
            className="w-full rounded-full border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2"
          >
            Reset Puzzle
          </button>
        </>
      )}

      {checkPhase === "success" && (
        <div role="status">
          <GlitchSpeech mood="happy">
            ⚡ Great work — you identified all the AI facts correctly! The
            keypad is now activated. Time to crack the code!
          </GlitchSpeech>
        </div>
      )}
    </div>
  );
}
