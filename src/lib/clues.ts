/**
 * Door-code clue scheme. Each digit puzzle awards a colored digit; the door
 * code is those digits entered in the order of this array (the color order
 * printed on the team handout). To change the code, edit the digits here
 * (order matters) — the keypad, reward screens and /dev all follow.
 */
export const CLUES: {
  color: string;
  puzzleId: string;
  digit: number;
  swatch: string;
  text: string;
}[] = [
  { color: "Green", puzzleId: "p3-prompt-precision", digit: 2, swatch: "bg-green-500", text: "text-green-600" },
  { color: "Blue", puzzleId: "p1-feedback-maze", digit: 4, swatch: "bg-blue-500", text: "text-blue-600" },
  { color: "Red", puzzleId: "p2-bad-data", digit: 6, swatch: "bg-red-500", text: "text-red-600" },
];

export const DOOR_CODE = CLUES.map((c) => c.digit).join(""); // "246"

export const clueFor = (puzzleId: string) => CLUES.find((c) => c.puzzleId === puzzleId);
