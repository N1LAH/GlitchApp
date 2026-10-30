import sources from "@/../content/handouts/bad-data-sources.json";
import pageText from "@/../content/handouts/page-text.json";

/**
 * Reference papers students can open from a button in the puzzle header. Each handout
 * names its own button (e.g. "Source Printouts") so it reads as part of that challenge.
 * Designed handouts are shown as page images (in public/handouts/) with a
 * text version for screen readers; the Bad Data printouts are plain text, so
 * they render as on-screen mock webpages.
 */
export type Run = { text: string; bold?: boolean; italic?: boolean };
export type SourcePage = {
  id: number;
  name: string;
  url: string;
  paras: { bold: boolean; runs: Run[] }[];
};

export type Handout =
  | { id: string; button: string; title: string; note?: string; kind: "pages"; pages: { src: string; text: string }[] }
  | { id: string; button: string; title: string; note?: string; kind: "sources"; sources: SourcePage[] };

function pageImages(dir: string, texts: string[]) {
  const pad = texts.length >= 10 ? 2 : 1;
  return texts.map((text, i) => ({
    src: `/handouts/${dir}/page-${String(i + 1).padStart(pad, "0")}.jpg`,
    text,
  }));
}

export const HANDOUTS: Record<string, Handout> = {
  "bad-data-sources": {
    id: "bad-data-sources",
    button: "Source Printouts",
    title: "Glitch's Research: Source Printouts",
    note: "These are mock webpages written for this game. They are not real web pages, and their links won't work.",
    kind: "sources",
    sources: sources as SourcePage[],
  },
  "prompting-guide": {
    id: "prompting-guide",
    button: "Prompting Guide",
    title: "Glitch's Cosmic Survival Guide to Prompting AI",
    kind: "pages",
    pages: pageImages("prompting-guide", pageText["prompting-guide"]),
  },
  "ai-crash-course": {
    id: "ai-crash-course",
    button: "AI Fact Booklet",
    title: "A Crash Course in Artificial Intelligence",
    kind: "pages",
    pages: pageImages("ai-crash-course", pageText["ai-crash-course"]),
  },
};

/** Which papers each puzzle offers from its header button. */
export const PAPERS_BY_PUZZLE: Record<string, string[]> = {
  "p2-bad-data": ["bad-data-sources"],
  "p3-prompt-precision": ["prompting-guide"],
  "p4-fact-fiction": ["ai-crash-course"],
};
