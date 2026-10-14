import { describe, it, expect } from "vitest";
import { validateSelections } from "./P2BadData";

describe("validateSelections", () => {
  it("returns 0 when all selections are correct", () => {
    const correctSelections = {
      1: "Fake" as const,
      2: "Credible" as const,
      3: "Fake" as const,
      4: "Credible" as const,
      5: "Fake" as const,
      6: "Credible" as const,
      7: "Credible" as const,
    };
    expect(validateSelections(correctSelections)).toBe(0);
  });

  it("returns correct count when some selections are wrong", () => {
    const partiallyWrong = {
      1: "Credible" as const,
      2: "Credible" as const,
      3: "Credible" as const,
      4: "Credible" as const,
      5: "Fake" as const,
      6: "Credible" as const,
      7: "Credible" as const,
    };
    expect(validateSelections(partiallyWrong)).toBe(2);
  });

  it("returns 7 when all selections are wrong", () => {
    const allWrong = {
      1: "Credible" as const,
      2: "Fake" as const,
      3: "Credible" as const,
      4: "Fake" as const,
      5: "Credible" as const,
      6: "Fake" as const,
      7: "Fake" as const,
    };
    expect(validateSelections(allWrong)).toBe(7);
  });

  it("returns 7 when no selections are made", () => {
    const emptySelections = {};
    expect(validateSelections(emptySelections)).toBe(7);
  });

  it("correctly identifies sources 1, 3, 5 as Fake", () => {
    const onlyFakes = {
      1: "Fake" as const,
      2: null,
      3: "Fake" as const,
      4: null,
      5: "Fake" as const,
      6: null,
      7: null,
    };
    const result = validateSelections(onlyFakes);
    expect(result).toBe(4);
  });

  it("correctly identifies sources 2, 4, 6, 7 as Credible", () => {
    const onlyCredible = {
      1: null,
      2: "Credible" as const,
      3: null,
      4: "Credible" as const,
      5: null,
      6: "Credible" as const,
      7: "Credible" as const,
    };
    const result = validateSelections(onlyCredible);
    expect(result).toBe(3);
  });
});
