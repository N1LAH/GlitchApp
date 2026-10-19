import { describe, it, expect } from "vitest";
import { CLUES, codeFor, randomCodeDigits } from "@/lib/clues";
import { formatTime } from "@/lib/time";

describe("randomCodeDigits", () => {
  it("gives every clue a distinct digit from 1 to 9", () => {
    for (let i = 0; i < 200; i++) {
      const code = randomCodeDigits();
      const values = CLUES.map((c) => code[c.puzzleId]);
      expect(new Set(values).size).toBe(CLUES.length);
      for (const d of values) {
        expect(d).toBeGreaterThanOrEqual(1);
        expect(d).toBeLessThanOrEqual(9);
      }
    }
  });

  it("never produces an evenly spaced code like 246 or 321", () => {
    for (let i = 0; i < 500; i++) {
      const [a, b, c] = codeFor(randomCodeDigits()).split("").map(Number);
      expect(b - a).not.toBe(c - b);
    }
  });

  it("builds the code in clue order", () => {
    const digits = Object.fromEntries(CLUES.map((c, i) => [c.puzzleId, i + 3]));
    expect(codeFor(digits)).toBe("345");
  });
});

describe("formatTime", () => {
  it("formats as h:mm:ss", () => {
    expect(formatTime(0)).toBe("0:00:00");
    expect(formatTime(65_000)).toBe("0:01:05");
    expect(formatTime(3_725_000)).toBe("1:02:05");
  });
});
