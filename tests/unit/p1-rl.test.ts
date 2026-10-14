import { describe, it, expect } from "vitest";
import {
  type Maze,
  type Memory,
  edgeKey,
  atGoal,
  isDeadEndNode,
  shouldStop,
  nextChoice,
  updateMemory,
} from "@/components/puzzle/p1-rl";

const testMaze: Maze = {
  start: "a",
  goal: "d",
  nodes: {
    a: { x: 0, y: 0, kind: "room", neighbors: ["b"] },
    b: { x: 25, y: 0, kind: "junction", neighbors: ["a", "c", "e"] },
    c: { x: 50, y: 0, kind: "room", neighbors: ["b", "d"] },
    d: { x: 75, y: 0, kind: "room", neighbors: ["c"] },
    e: { x: 25, y: 25, kind: "deadend", neighbors: ["b"] },
  },
};

describe("p1-rl", () => {
  describe("edgeKey", () => {
    it("creates a directed edge key", () => {
      expect(edgeKey("a", "b")).toBe("a->b");
      expect(edgeKey("b", "a")).toBe("b->a");
    });
  });

  describe("atGoal", () => {
    it("returns true only at goal node", () => {
      expect(atGoal("d", testMaze)).toBe(true);
      expect(atGoal("a", testMaze)).toBe(false);
      expect(atGoal("b", testMaze)).toBe(false);
    });
  });

  describe("isDeadEndNode", () => {
    it("returns true for nodes with kind deadend", () => {
      expect(isDeadEndNode("e", testMaze)).toBe(true);
      expect(isDeadEndNode("a", testMaze)).toBe(false);
      expect(isDeadEndNode("b", testMaze)).toBe(false);
    });
  });

  describe("shouldStop", () => {
    it("returns true for room nodes", () => {
      expect(shouldStop("a", undefined, testMaze)).toBe(true);
      expect(shouldStop("c", "b", testMaze)).toBe(true);
    });

    it("returns true for deadend nodes", () => {
      expect(shouldStop("e", "b", testMaze)).toBe(true);
    });

    it("returns true for junctions with multiple real choices", () => {
      expect(shouldStop("b", "a", testMaze)).toBe(true);
    });

    it("returns false for junctions with only one choice after excluding prev", () => {
      const singlePathMaze: Maze = {
        start: "a",
        goal: "c",
        nodes: {
          a: { x: 0, y: 0, kind: "room", neighbors: ["b"] },
          b: { x: 25, y: 0, kind: "junction", neighbors: ["a", "c"] },
          c: { x: 50, y: 0, kind: "room", neighbors: ["b"] },
        },
      };
      expect(shouldStop("b", "a", singlePathMaze)).toBe(false);
    });
  });

  describe("nextChoice", () => {
    it("returns the only neighbor when there is one option", () => {
      const result = nextChoice("a", undefined, testMaze, {});
      expect(result.next).toBe("b");
      expect(result.choiceEdge).toBe("a->b");
    });

    it("excludes prev when there are multiple neighbors", () => {
      const memory: Memory = {};
      const result = nextChoice("b", "a", testMaze, memory);
      expect(["c", "e"]).toContain(result.next);
    });

    it("biases toward edges with higher correct - incorrect scores", () => {
      const memory: Memory = {
        "b->c": { correct: 10, incorrect: 0 },
        "b->e": { correct: 0, incorrect: 10 },
      };

      const choices: string[] = [];
      for (let i = 0; i < 100; i++) {
        const result = nextChoice("b", "a", testMaze, memory);
        choices.push(result.next);
      }

      const cCount = choices.filter((n) => n === "c").length;
      const eCount = choices.filter((n) => n === "e").length;

      expect(cCount).toBeGreaterThan(eCount);
      expect(cCount).toBeGreaterThan(50);
    });

    it("gives every option a non-zero chance via epsilon", () => {
      const memory: Memory = {
        "b->c": { correct: 100, incorrect: 0 },
        "b->e": { correct: 0, incorrect: 100 },
      };

      const choices: string[] = [];
      for (let i = 0; i < 1000; i++) {
        const result = nextChoice("b", "a", testMaze, memory);
        choices.push(result.next);
      }

      const eCount = choices.filter((n) => n === "e").length;
      expect(eCount).toBeGreaterThan(0);
    });
  });

  describe("updateMemory", () => {
    it("increments correct count for correct label", () => {
      const memory: Memory = { "a->b": { correct: 0, incorrect: 0 } };
      const updated = updateMemory(memory, "a->b", "correct");
      expect(updated["a->b"].correct).toBe(1);
      expect(updated["a->b"].incorrect).toBe(0);
    });

    it("increments incorrect count for incorrect label", () => {
      const memory: Memory = { "a->b": { correct: 0, incorrect: 0 } };
      const updated = updateMemory(memory, "a->b", "incorrect");
      expect(updated["a->b"].correct).toBe(0);
      expect(updated["a->b"].incorrect).toBe(1);
    });

    it("creates new edge entry if not present", () => {
      const memory: Memory = {};
      const updated = updateMemory(memory, "x->y", "correct");
      expect(updated["x->y"]).toEqual({ correct: 1, incorrect: 0 });
    });

    it("does not mutate original memory", () => {
      const memory: Memory = { "a->b": { correct: 5, incorrect: 3 } };
      const updated = updateMemory(memory, "a->b", "correct");
      expect(memory["a->b"].correct).toBe(5);
      expect(updated["a->b"].correct).toBe(6);
    });
  });
});
