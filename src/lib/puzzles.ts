import defs from "@/../content/puzzles/index.json";
import { PuzzleDef } from "@/types/puzzle";

export const allPuzzles = defs as PuzzleDef[];

export const byId = (id: string): PuzzleDef | undefined =>
  allPuzzles.find((p) => p.id === id);

export const unmetDeps = (
  id: string,
  solved: Record<string, boolean>
): string[] => (byId(id)?.requires ?? []).filter((dep) => !solved[dep]);
