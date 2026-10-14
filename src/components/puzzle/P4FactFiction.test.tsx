import { describe, it, expect } from "vitest";
import { scoreAssignments, STATEMENTS } from "./P4FactFiction";

const correctAssignments = Object.fromEntries(
  STATEMENTS.map((s) => [s.id, s.answer])
) as Record<string, "Fact" | "Fiction">;

describe("scoreAssignments", () => {
  it("returns 8 when all are correct", () => {
    expect(scoreAssignments(correctAssignments)).toBe(8);
  });

  it("returns 0 when all are wrong", () => {
    const flipped = Object.fromEntries(
      STATEMENTS.map((s) => [s.id, s.answer === "Fact" ? "Fiction" : "Fact"])
    ) as Record<string, "Fact" | "Fiction">;
    expect(scoreAssignments(flipped)).toBe(0);
  });

  it("returns 0 for empty assignments", () => {
    expect(scoreAssignments({})).toBe(0);
  });

  it("counts partially correct assignments", () => {
    const partial = { ...correctAssignments, s1: "Fact" as const };
    expect(scoreAssignments(partial)).toBe(7);
  });

  it("correctly scores all Fact statements", () => {
    const onlyFacts = Object.fromEntries(
      STATEMENTS.filter((s) => s.answer === "Fact").map((s) => [s.id, "Fact" as const])
    );
    expect(scoreAssignments(onlyFacts)).toBe(4);
  });

  it("correctly scores all Fiction statements", () => {
    const onlyFiction = Object.fromEntries(
      STATEMENTS.filter((s) => s.answer === "Fiction").map((s) => [s.id, "Fiction" as const])
    );
    expect(scoreAssignments(onlyFiction)).toBe(4);
  });
});
