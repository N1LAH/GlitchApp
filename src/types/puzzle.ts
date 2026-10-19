export type PuzzleId =
  | "p1-feedback-maze"
  | "p2-bad-data"
  | "p3-prompt-precision"
  | "p4-fact-fiction"
  | "p5-final-console";

export type PuzzleKind =
  | "maze"
  | "multiselect"
  | "text-entry"
  | "slider"
  | "keypad";

export interface PuzzleDef {
  id: PuzzleId;
  title: string;
  kind: PuzzleKind;
  /** Plain-language activity label shown to players (e.g. "Check sources"). */
  label: string;
  description: string;
  requires?: PuzzleId[];
  /** digit: awards this session's colored door-code digit (see lib/clues.ts). */
  grants?: { digit?: boolean; token?: string };
}
