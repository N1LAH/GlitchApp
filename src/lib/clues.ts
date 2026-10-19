/**
 * Door-code clue scheme. Each digit puzzle awards a colored digit; the door
 * code is those digits entered in the order of this array (the color order
 * printed on the team handout). Digits are randomized per game session — see
 * randomCodeDigits() — so the code can't be memorized or passed between teams.
 * Facilitators can see the current session's code on /dev.
 */
export const CLUES: {
  color: string;
  puzzleId: string;
  swatch: string;
  text: string;
}[] = [
  { color: "Green", puzzleId: "p3-prompt-precision", swatch: "bg-green-500", text: "text-green-600" },
  { color: "Blue", puzzleId: "p1-feedback-maze", swatch: "bg-blue-500", text: "text-blue-600" },
  { color: "Red", puzzleId: "p2-bad-data", swatch: "bg-red-500", text: "text-red-600" },
];

export const clueFor = (puzzleId: string) => CLUES.find((c) => c.puzzleId === puzzleId);

/** The full door code for a session, in CLUES order. */
export function codeFor(codeDigits: Record<string, number>): string {
  return CLUES.map((c) => codeDigits[c.puzzleId]).join("");
}

/**
 * Three distinct digits (1–9), one per clue, that never form an evenly spaced
 * run like 2-4-6 or 3-2-1 in code order, so the code can't be guessed from a
 * pattern.
 */
export function randomCodeDigits(rand: () => number = Math.random): Record<string, number> {
  for (;;) {
    const pool = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const picked = CLUES.map(() => pool.splice(Math.floor(rand() * pool.length), 1)[0]);
    const evenlySpaced = picked[1] - picked[0] === picked[2] - picked[1];
    if (!evenlySpaced) {
      return Object.fromEntries(CLUES.map((c, i) => [c.puzzleId, picked[i]]));
    }
  }
}
