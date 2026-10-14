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
  description: string;
  requires?: PuzzleId[];
  grants?: { digit?: number; token?: string };
}
