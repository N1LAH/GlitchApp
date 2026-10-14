"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import GlitchSpeech from "@/components/GlitchSpeech";

export type SlotType = "Persona" | "Context" | "Task" | "Constraints" | "Tone / Style" | "Output Format";

export interface CardDef {
  id: string;
  type: SlotType;
  text: string;
  correct: boolean;
}

const SLOT_ORDER: SlotType[] = [
  "Persona",
  "Context",
  "Task",
  "Constraints",
  "Tone / Style",
  "Output Format",
];

const CARDS: CardDef[] = [
  { id: "persona-1", type: "Persona", text: "Calm, logical starship systems engineer focused on safety and accuracy.", correct: true },
  { id: "persona-2", type: "Persona", text: "Creative science-fiction storyteller", correct: false },
  { id: "persona-3", type: "Persona", text: "Motivational leadership coach", correct: false },
  { id: "persona-4", type: "Persona", text: "Friendly AI assistant eager to help", correct: false },
  { id: "persona-5", type: "Persona", text: "Experimental AI researcher exploring hypotheses", correct: false },

  { id: "context-1", type: "Context", text: "Locked out of the life-support console, oxygen dropping fast.", correct: true },
  { id: "context-2", type: "Context", text: "General ship malfunction detected", correct: false },
  { id: "context-3", type: "Context", text: "Crew morale is low after system update", correct: false },
  { id: "context-4", type: "Context", text: "Oxygen systems behaving unpredictably", correct: false },
  { id: "context-5", type: "Context", text: "You are assisting the captain with repairs", correct: false },

  { id: "task-1", type: "Task", text: "Generate the precise repair code to seal a leak in conduit B-7.", correct: true },
  { id: "task-2", type: "Task", text: "Help restore oxygen to the ship", correct: false },
  { id: "task-3", type: "Task", text: "Explain how oxygen systems usually work", correct: false },
  { id: "task-4", type: "Task", text: "Suggest possible fixes for life-support failures", correct: false },
  { id: "task-5", type: "Task", text: "Analyze the cause of the malfunction", correct: false },

  { id: "constraints-1", type: "Constraints", text: "Under 100 words; verified technical commands only; no humor or speculation.", correct: true },
  { id: "constraints-2", type: "Constraints", text: "Be concise and helpful", correct: false },
  { id: "constraints-3", type: "Constraints", text: "Include explanations for your reasoning", correct: false },
  { id: "constraints-4", type: "Constraints", text: "Optimize for creativity and insight", correct: false },
  { id: "constraints-5", type: "Constraints", text: "Use best practices where possible", correct: false },

  { id: "tone-1", type: "Tone / Style", text: "Clear, confident, procedural.", correct: true },
  { id: "tone-2", type: "Tone / Style", text: "Friendly and conversational", correct: false },
  { id: "tone-3", type: "Tone / Style", text: "Reassuring and empathetic", correct: false },
  { id: "tone-4", type: "Tone / Style", text: "Dramatic and urgent", correct: false },
  { id: "tone-5", type: "Tone / Style", text: "Humorous to reduce stress", correct: false },

  { id: "output-1", type: "Output Format", text: "Strict SYSTEM OVERRIDE syntax with status confirmation.", correct: true },
  { id: "output-2", type: "Output Format", text: "Paragraph explanation", correct: false },
  { id: "output-3", type: "Output Format", text: "Step-by-step checklist", correct: false },
  { id: "output-4", type: "Output Format", text: "Narrative report with conclusions", correct: false },
  { id: "output-5", type: "Output Format", text: "Code-like output without strict syntax", correct: false },
];

const FAILURE_PRIORITY: SlotType[] = [
  "Task",
  "Output Format",
  "Constraints",
  "Persona",
  "Context",
  "Tone / Style",
];

const FAILURE_MESSAGES: Record<SlotType, string> = {
  "Task": "You did not instruct me to do anything. I can explain the emergency in great detail, but oxygen remains at zero.",
  "Output Format": "Command generated. Format incompatible with ship systems. Override rejected.",
  "Constraints": "Multiple solution paths detected. Repair bots awaiting clarification. Oxygen continues to drop.",
  "Persona": "Switching to morale-optimization mode. Crew confidence rising. Oxygen unchanged.",
  "Context": "System status unclear. Awaiting situational confirmation before executing commands.",
  "Tone / Style": "Stylistic modulation detected. Procedural clarity reduced. Command execution aborted.",
};

const ALMOST_CORRECT_HINTS: Record<SlotType, string> = {
  "Task": "You did not instruct me to execute a specific repair action.",
  "Output Format": "Execution syntax is incompatible with ship systems.",
  "Constraints": "Operational limits are undefined.",
  "Persona": "Authority and safety posture are misaligned.",
  "Context": "Execution conditions are incomplete. System state and urgency are unclear.",
  "Tone / Style": "Instruction intent is correct, but delivery style interferes with procedural execution.",
};

export interface ValidationResult {
  correctCount: number;
  wrongSlots: SlotType[];
  highestPriorityFailure: SlotType | null;
}

export function validateAssembly(
  assignments: Record<SlotType, string | null>,
  cardMap: Record<string, CardDef>
): ValidationResult {
  let correctCount = 0;
  const wrongSlots: SlotType[] = [];

  for (const slot of SLOT_ORDER) {
    const cardId = assignments[slot];
    if (cardId && cardMap[cardId]?.correct) {
      correctCount++;
    } else {
      wrongSlots.push(slot);
    }
  }

  let highestPriorityFailure: SlotType | null = null;
  for (const slot of FAILURE_PRIORITY) {
    if (wrongSlots.includes(slot)) {
      highestPriorityFailure = slot;
      break;
    }
  }

  return { correctCount, wrongSlots, highestPriorityFailure };
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

interface Props {
  onSolved: () => void;
}

export default function P3PromptAssembly({ onSolved }: Props) {
  const cardMap = useRef<Record<string, CardDef>>(
    Object.fromEntries(CARDS.map((c) => [c.id, c]))
  ).current;

  const [assignments, setAssignments] = useState<Record<SlotType, string | null>>({
    "Persona": null,
    "Context": null,
    "Task": null,
    "Constraints": null,
    "Tone / Style": null,
    "Output Format": null,
  });

  const [trayCards, setTrayCards] = useState<CardDef[]>(CARDS);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTrayCards(shuffleArray(CARDS));
  }, []);
  const [attempts, setAttempts] = useState(0);
  const [feedbackMessages, setFeedbackMessages] = useState<string[]>([]);
  const [locked, setLocked] = useState(false);
  const [success, setSuccess] = useState(false);
  const [almostCorrectUsed, setAlmostCorrectUsed] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [typeError, setTypeError] = useState<string | null>(null);
  const [showReset, setShowReset] = useState(false);
  const [expandedTrays, setExpandedTrays] = useState<Record<SlotType, boolean>>({
    "Persona": false,
    "Context": false,
    "Task": false,
    "Constraints": false,
    "Tone / Style": false,
    "Output Format": false,
  });

  const toggleTray = useCallback((slotType: SlotType) => {
    setExpandedTrays((prev) => ({ ...prev, [slotType]: !prev[slotType] }));
  }, []);

  const feedbackRef = useRef<HTMLDivElement>(null);
  const liveRegionRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const announce = useCallback((msg: string) => {
    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = msg;
    }
  }, []);

  const assignedCardIds = new Set(
    Object.values(assignments).filter((v): v is string => v !== null)
  );
  const availableTrayCards = trayCards.filter((c) => !assignedCardIds.has(c.id));
  const allSlotsFilled = SLOT_ORDER.every((s) => assignments[s] !== null);

  const assignCard = useCallback(
    (slotType: SlotType, cardId: string) => {
      if (locked) return;
      const card = cardMap[cardId];
      if (!card || card.type !== slotType) {
        setTypeError("Wrong component type for this slot");
        setTimeout(() => setTypeError(null), 2000);
        return;
      }

      setAssignments((prev) => {
        const oldCardId = prev[slotType];
        if (oldCardId && oldCardId !== cardId) {
          announce(`Replaced card in ${slotType} slot.`);
        }
        return { ...prev, [slotType]: cardId };
      });
      setSelectedCardId(null);
      setTypeError(null);
      announce(`Assigned to ${slotType}.`);
    },
    [locked, cardMap, announce]
  );

  const unassignCard = useCallback(
    (slotType: SlotType) => {
      if (locked) return;
      setAssignments((prev) => ({ ...prev, [slotType]: null }));
    },
    [locked]
  );

  const handleDragStart = useCallback(
    (e: React.DragEvent, cardId: string) => {
      if (locked) return;
      e.dataTransfer.setData("text/plain", cardId);
      e.dataTransfer.effectAllowed = "move";
    },
    [locked]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, slotType: SlotType) => {
      e.preventDefault();
      const cardId = e.dataTransfer.getData("text/plain");
      if (cardId) assignCard(slotType, cardId);
    },
    [assignCard]
  );

  const handleKeyAssign = useCallback(
    (slotType: SlotType) => {
      if (!selectedCardId || locked) return;
      assignCard(slotType, selectedCardId);
    },
    [selectedCardId, locked, assignCard]
  );

  const clearAllSlots = useCallback(() => {
    setAssignments({
      "Persona": null,
      "Context": null,
      "Task": null,
      "Constraints": null,
      "Tone / Style": null,
      "Output Format": null,
    });
    setTrayCards(shuffleArray(CARDS));
    announce("Prompt cleared. Try again.");
  }, [announce]);

  const handleCheckPrompt = useCallback(() => {
    if (!allSlotsFilled || locked) return;

    const result = validateAssembly(assignments, cardMap);

    if (result.correctCount === 6) {
      setSuccess(true);
      setLocked(true);
      setFeedbackMessages([
        "SYSTEM OVERRIDE ACCEPTED",
        "Oxygen stabilized at 14.7 psi",
        "Crew survival likelihood confirmed",
      ]);
      onSolved();
      return;
    }

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    const messages: string[] = [];

    if (result.highestPriorityFailure) {
      messages.push(FAILURE_MESSAGES[result.highestPriorityFailure]);
    }

    if (newAttempts >= 2) {
      messages.push(
        "I am executing exactly what you instructed. One or more structural instruction components are missing or malformed."
      );
    }

    if (result.correctCount === 5 && !almostCorrectUsed && result.highestPriorityFailure) {
      messages.push(ALMOST_CORRECT_HINTS[result.highestPriorityFailure]);
      setAlmostCorrectUsed(true);
    }

    if (newAttempts >= 6) {
      messages.push(
        "You have attempted multiple structural configurations. This is a good time to request a hint from your facilitator."
      );
    }

    messages.push(
      "The system reports only the highest-priority failure per submission. Correcting one issue may surface additional issues on subsequent attempts."
    );

    setFeedbackMessages(messages);
    setShowReset(true);
  }, [allSlotsFilled, locked, assignments, cardMap, attempts, almostCorrectUsed, onSolved]);

  const handleReset = useCallback(() => {
    clearAllSlots();
    setFeedbackMessages([]);
    setShowReset(false);
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [clearAllSlots]);

  useEffect(() => {
    if (feedbackMessages.length > 0 && feedbackRef.current) {
      feedbackRef.current.focus();
    }
  }, [feedbackMessages]);

  const groupedTray: Record<SlotType, CardDef[]> = {
    "Persona": [],
    "Context": [],
    "Task": [],
    "Constraints": [],
    "Tone / Style": [],
    "Output Format": [],
  };
  for (const card of availableTrayCards) {
    groupedTray[card.type].push(card);
  }

  return (
    <div ref={topRef} className="space-y-4 text-slate-800">
      <div
        ref={liveRegionRef}
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      />

      <GlitchSpeech mood="worried">
        The oxygen system only responds to perfectly structured prompts, and I
        can&apos;t remember how to write one. Build it for me — fast!
      </GlitchSpeech>

      <p className="text-sm text-slate-600">
        Build a structured prompt by assigning one card to each slot. Drag cards or use keyboard (Tab to focus, Enter to select/assign).
      </p>

      <div className="flex items-center gap-4 text-sm">
        <span className="text-slate-500">Attempts: <span className="text-slate-800 font-semibold">{attempts}</span></span>
      </div>

      {typeError && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-2 text-sm text-amber-800" role="alert">
          {typeError}
        </div>
      )}

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-puzzle-blue uppercase tracking-wide">Prompt Scaffold</h3>
        {SLOT_ORDER.map((slotType) => {
          const cardId = assignments[slotType];
          const card = cardId ? cardMap[cardId] : null;
          const isSelected = selectedCardId !== null && cardMap[selectedCardId]?.type === slotType;
          const trayCardsForSlot = groupedTray[slotType];
          const isExpanded = expandedTrays[slotType];

          return (
            <div key={slotType} className="space-y-0">
              <div
                className={`rounded-2xl border-2 p-3 transition-colors ${
                  success && card
                    ? "border-emerald-400 bg-emerald-50"
                    : isSelected
                    ? "border-puzzle-blue bg-sky-50"
                    : card
                    ? "border-slate-300 bg-white shadow-sm"
                    : "border-dashed border-slate-300 bg-slate-50"
                }`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, slotType)}
                tabIndex={0}
                role="region"
                aria-label={`${slotType} slot${card ? `: ${card.text}` : " (empty)"}`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    if (card && !locked) {
                      unassignCard(slotType);
                    } else {
                      handleKeyAssign(slotType);
                    }
                  }
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-xs font-semibold uppercase tracking-wider text-puzzle-blue">
                      {slotType}
                    </span>
                    {card ? (
                      <p className="text-sm text-slate-800 mt-1">{card.text}</p>
                    ) : (
                      <p className="text-sm text-slate-500 mt-1 italic">Drop a {slotType} card here</p>
                    )}
                  </div>
                  {card && !locked && (
                    <button
                      onClick={() => unassignCard(slotType)}
                      className="text-xs text-slate-500 hover:text-rose-600 shrink-0 mt-1"
                      aria-label={`Remove card from ${slotType} slot`}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {!locked && trayCardsForSlot.length > 0 && (
                <div className="ml-2 mr-2">
                  <button
                    onClick={() => toggleTray(slotType)}
                    className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 py-1 transition-colors focus:outline-none focus:ring-1 focus:ring-puzzle-blue/60 rounded"
                    aria-expanded={isExpanded}
                    aria-controls={`tray-${slotType.replace(/\s|\//g, "-")}`}
                  >
                    <span className={`inline-block transition-transform ${isExpanded ? "rotate-90" : ""}`}>▶</span>
                    {slotType} Cards: {trayCardsForSlot.length} option{trayCardsForSlot.length !== 1 ? "s" : ""} available
                  </button>
                  {isExpanded && (
                    <div
                      id={`tray-${slotType.replace(/\s|\//g, "-")}`}
                      className="flex flex-wrap gap-2 pb-2 pt-1"
                    >
                      {trayCardsForSlot.map((trayCard) => (
                        <div
                          key={trayCard.id}
                          draggable={!locked}
                          onDragStart={(e) => handleDragStart(e, trayCard.id)}
                          tabIndex={0}
                          role="button"
                          aria-label={`${trayCard.type} card: ${trayCard.text}`}
                          aria-pressed={selectedCardId === trayCard.id}
                          className={`px-3 py-2 rounded-xl border text-sm cursor-grab active:cursor-grabbing transition-colors focus:outline-none focus:ring-2 focus:ring-puzzle-blue/60 ${
                            selectedCardId === trayCard.id
                              ? "border-puzzle-blue bg-sky-100 text-slate-900"
                              : "border-slate-300 bg-white text-slate-700 shadow-sm hover:border-puzzle-blue/60"
                          }`}
                          onClick={() => {
                            if (locked) return;
                            setSelectedCardId(selectedCardId === trayCard.id ? null : trayCard.id);
                            setTypeError(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              if (locked) return;
                              setSelectedCardId(selectedCardId === trayCard.id ? null : trayCard.id);
                              setTypeError(null);
                            }
                          }}
                          onFocus={() => {
                            if (!locked) {
                              setSelectedCardId(trayCard.id);
                              setTypeError(null);
                            }
                          }}
                        >
                          {trayCard.text}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!locked && !showReset && (
        <button
          onClick={handleCheckPrompt}
          disabled={!allSlotsFilled}
          className="w-full rounded-full bg-puzzle-blue px-4 py-2 font-semibold text-white transition-colors hover:bg-puzzle-blue/90 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 focus:outline-none focus:ring-2 focus:ring-puzzle-blue/50 focus:ring-offset-2"
        >
          Check Prompt →
        </button>
      )}

      {!locked && showReset && (
        <button
          onClick={handleReset}
          className="w-full rounded-full border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2"
        >
          Reset Puzzle
        </button>
      )}

      {feedbackMessages.length > 0 && (
        <div
          ref={feedbackRef}
          tabIndex={-1}
          className={`rounded-2xl border-2 p-4 space-y-2 outline-none font-mono text-[13px] ${
            success
              ? "border-emerald-300 bg-emerald-50"
              : "border-rose-300 bg-rose-50"
          }`}
          role="alert"
          aria-live="polite"
        >
          {feedbackMessages.map((msg, i) => (
            <p
              key={i}
              className={`text-sm ${
                success
                  ? i === 0
                    ? "text-emerald-700 font-bold text-base"
                    : "text-emerald-800"
                  : i === 0
                  ? "text-rose-700 font-semibold"
                  : "text-slate-600"
              }`}
            >
              {msg}
            </p>
          ))}
          {success && (
            <p className="text-emerald-700 font-bold text-lg mt-2">
              Digit Revealed: 2
            </p>
          )}
        </div>
      )}
    </div>
  );
}
