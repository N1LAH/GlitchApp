import { describe, it, expect } from "vitest";
import { validateAssembly, SlotType, CardDef } from "./P3PromptAssembly";

const correctCards: Record<SlotType, CardDef> = {
  "Persona": { id: "persona-1", type: "Persona", text: "", correct: true },
  "Context": { id: "context-1", type: "Context", text: "", correct: true },
  "Task": { id: "task-1", type: "Task", text: "", correct: true },
  "Constraints": { id: "constraints-1", type: "Constraints", text: "", correct: true },
  "Tone / Style": { id: "tone-1", type: "Tone / Style", text: "", correct: true },
  "Output Format": { id: "output-1", type: "Output Format", text: "", correct: true },
};

const wrongCards: Record<SlotType, CardDef> = {
  "Persona": { id: "persona-2", type: "Persona", text: "", correct: false },
  "Context": { id: "context-2", type: "Context", text: "", correct: false },
  "Task": { id: "task-2", type: "Task", text: "", correct: false },
  "Constraints": { id: "constraints-2", type: "Constraints", text: "", correct: false },
  "Tone / Style": { id: "tone-2", type: "Tone / Style", text: "", correct: false },
  "Output Format": { id: "output-2", type: "Output Format", text: "", correct: false },
};

function buildCardMap(cards: CardDef[]): Record<string, CardDef> {
  return Object.fromEntries(cards.map((c) => [c.id, c]));
}

const allCards = [...Object.values(correctCards), ...Object.values(wrongCards)];
const cardMap = buildCardMap(allCards);

function makeAssignments(overrides: Partial<Record<SlotType, string>> = {}): Record<SlotType, string | null> {
  const base: Record<SlotType, string | null> = {
    "Persona": correctCards["Persona"].id,
    "Context": correctCards["Context"].id,
    "Task": correctCards["Task"].id,
    "Constraints": correctCards["Constraints"].id,
    "Tone / Style": correctCards["Tone / Style"].id,
    "Output Format": correctCards["Output Format"].id,
  };
  for (const [k, v] of Object.entries(overrides)) {
    base[k as SlotType] = v;
  }
  return base;
}

describe("validateAssembly", () => {
  it("returns 6 correct when all slots have correct cards", () => {
    const result = validateAssembly(makeAssignments(), cardMap);
    expect(result.correctCount).toBe(6);
    expect(result.wrongSlots).toEqual([]);
    expect(result.highestPriorityFailure).toBeNull();
  });

  it("returns 0 correct when all slots have wrong cards", () => {
    const assignments = makeAssignments({
      "Persona": wrongCards["Persona"].id,
      "Context": wrongCards["Context"].id,
      "Task": wrongCards["Task"].id,
      "Constraints": wrongCards["Constraints"].id,
      "Tone / Style": wrongCards["Tone / Style"].id,
      "Output Format": wrongCards["Output Format"].id,
    });
    const result = validateAssembly(assignments, cardMap);
    expect(result.correctCount).toBe(0);
    expect(result.wrongSlots.length).toBe(6);
  });

  it("returns Task as highest priority failure when Task is wrong", () => {
    const assignments = makeAssignments({ "Task": wrongCards["Task"].id });
    const result = validateAssembly(assignments, cardMap);
    expect(result.correctCount).toBe(5);
    expect(result.highestPriorityFailure).toBe("Task");
  });

  it("returns Output Format as highest priority when Task is correct but Output Format is wrong", () => {
    const assignments = makeAssignments({ "Output Format": wrongCards["Output Format"].id });
    const result = validateAssembly(assignments, cardMap);
    expect(result.highestPriorityFailure).toBe("Output Format");
  });

  it("follows priority order: Task > Output Format > Constraints > Persona > Context > Tone", () => {
    const assignments = makeAssignments({
      "Persona": wrongCards["Persona"].id,
      "Tone / Style": wrongCards["Tone / Style"].id,
    });
    const result = validateAssembly(assignments, cardMap);
    expect(result.highestPriorityFailure).toBe("Persona");
    expect(result.correctCount).toBe(4);
  });

  it("detects almost-correct (5/6) scenario", () => {
    const assignments = makeAssignments({ "Tone / Style": wrongCards["Tone / Style"].id });
    const result = validateAssembly(assignments, cardMap);
    expect(result.correctCount).toBe(5);
    expect(result.highestPriorityFailure).toBe("Tone / Style");
  });

  it("handles null assignments as wrong", () => {
    const assignments = makeAssignments({ "Task": null as unknown as string });
    const result = validateAssembly(assignments, cardMap);
    expect(result.wrongSlots).toContain("Task");
    expect(result.highestPriorityFailure).toBe("Task");
  });

  it("Constraints failure has higher priority than Context", () => {
    const assignments = makeAssignments({
      "Constraints": wrongCards["Constraints"].id,
      "Context": wrongCards["Context"].id,
    });
    const result = validateAssembly(assignments, cardMap);
    expect(result.highestPriorityFailure).toBe("Constraints");
  });
});
