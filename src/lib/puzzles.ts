import defs from "@/../content/puzzles/index.json";
import { PuzzleDef } from "@/types/puzzle";

export const allPuzzles = defs as PuzzleDef[];

export const byId = (id: string): PuzzleDef | undefined =>
  allPuzzles.find((p) => p.id === id);

export const unmetDeps = (
  id: string,
  solved: Record<string, boolean>
): string[] => (byId(id)?.requires ?? []).filter((dep) => !solved[dep]);

/** "Bad Data", "Bad Data and Fact or Fiction", "A, B and C". */
export function titleList(ids: string[]): string {
  const titles = ids.map((id) => byId(id)?.title ?? id);
  if (titles.length <= 1) return titles.join("");
  return `${titles.slice(0, -1).join(", ")} and ${titles[titles.length - 1]}`;
}
