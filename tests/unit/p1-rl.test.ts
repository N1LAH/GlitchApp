import { describe, it, expect } from "vitest";
import {
  type Maze,
  type Memory,
  edgeKey,
  atGoal,
  isDeadEndNode,
  candidatesFrom,
  isGoodMove,
  nextChoice,
  updateMemory,
} from "@/components/puzzle/p1-rl";
import shipMazeData from "@/components/puzzle/p1-maze.json";

const shipMaze = shipMazeData as Maze;

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

  describe("candidatesFrom", () => {
    it("excludes the node Glitch just came from", () => {
      expect(candidatesFrom("b", "a", testMaze).sort()).toEqual(["c", "e"]);
    });

    it("allows turning back when there is no other way", () => {
      expect(candidatesFrom("e", "b", testMaze)).toEqual(["b"]);
    });
  });

  describe("isGoodMove", () => {
    it("treats steps toward the goal as good", () => {
      expect(isGoodMove("a", "b", testMaze)).toBe(true);
      expect(isGoodMove("b", "c", testMaze)).toBe(true);
    });

    it("treats dead ends and steps away from the goal as bad", () => {
      expect(isGoodMove("b", "e", testMaze)).toBe(false);
      expect(isGoodMove("c", "b", testMaze)).toBe(false);
    });

    it("follows the shortest route on the real ship maze", () => {
      expect(isGoodMove("lab", "medical", shipMaze)).toBe(true);
      expect(isGoodMove("lab", "de4", shipMaze)).toBe(false);
      expect(isGoodMove("crew", "rec", shipMaze)).toBe(true);
      expect(isGoodMove("crew", "b1", shipMaze)).toBe(false);
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

    it("makes a single piece of feedback change Glitch's choice", () => {
      const memory: Memory = { "b->e": { correct: 0, incorrect: 1 } };
      let eCount = 0;
      for (let i = 0; i < 1000; i++) {
        if (nextChoice("b", "a", testMaze, memory).next === "e") eCount++;
      }
      expect(eCount).toBeLessThan(250);
    });

    it("never re-proposes a move the student just rejected when another exists", () => {
      for (let i = 0; i < 50; i++) {
        expect(nextChoice("b", "a", testMaze, {}, false, ["e"]).next).toBe("c");
      }
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
