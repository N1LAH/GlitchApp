# CLAUDE.md — Glitch: The STEM Challenge

Context for anyone (human or AI) picking up this project. Last updated 2026-07-13.

## What this is

An escape-room-style **web game** teaching kids (12–16) how AI works, across five puzzles.
Players help a glitchy lab AI ("Glitch") by solving AI-themed puzzles to collect digits and
unlock the lab door. Built for a WWT / Cummins AI escape-room activity.

## Tech stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** + a few shadcn/ui + Radix components
- **Zustand** for state (`src/store/progress.ts`) — progress is saved in the browser's
  `localStorage` (key `glitch_progress_v1`), so every player/device gets an independent session.
- **Vitest** for unit tests.

Run locally: `npm install` then `npm run dev` (serves on port 5000).

## Puzzle flow (current code)

Order: **Maze (RL) → Bad Data → Prompt Precision → Fact or Fiction → Final Console (keypad)**.
Defined in `content/puzzles/index.json`. Components in `src/components/puzzle/`:

- `P1ReinforcementMaze.tsx` — reinforcement-learning maze; player marks moves Correct/Incorrect
  until Glitch reaches the Bridge. Grants digit 4.
- `P2BadData.tsx` — mark sources credible/unreliable. Grants digit 6.
- `P3PromptAssembly.tsx` — assemble a 6-slot prompt (drag/assign). Grants digit 2.
- `P4FactFiction.tsx` — sort statements true/false. Grants token UNLOCK5 (requires P1–P3).
- `P5FinalConsole.tsx` — the keypad; enter the 3-digit code to escape.

Puzzle routing/host: `src/app/puzzles/[id]/page.tsx` + `src/components/puzzle/PuzzleHost.tsx`.

## Changes already made (done + tested: typecheck clean, 35 tests pass)

1. **RL maze completion blurb** — `P1ReinforcementMaze.tsx` now shows a "what you did right"
   summary (tally of good moves vs. wrong turns + the RL lesson) when Glitch reaches the Bridge.
2. **Real keypad** — `P5FinalConsole.tsx` is new. It was previously just a static image with no
   input. Now: shows color clues, accepts a 3-digit code, validates, unlocks → End screen.
3. **Production cleanup** — dev toolbar (`layout.tsx`) and the "Mark as Solved (Demo)" skip
   buttons (`puzzles/[id]/page.tsx`) are hidden in production (`NODE_ENV === "production"`).
4. **Labels** — "Final Challenge" → "Unlock the Door" (`episodes/page.tsx`, `how-to-play/page.tsx`).
5. **Dependency fixes** (`package.json`) — bumped **Next 14.2.15 → 14.2.33** (14.2.15 was CVE-flagged
   and blocked by Replit's firewall), and moved test libs (vitest, @testing-library/*, jsdom,
   @vitejs/plugin-react, vite-tsconfig-paths) from `dependencies` to `devDependencies` where they belong.
6. **Figma-style redesign applied everywhere** (2026-07-14, per `DESIGN-NOTES.md`) — light card-based
   UI with per-puzzle accents (P1 purple, P2 orange, P3 blue, P4 green, P5 red): P1–P4 puzzle
   internals, how-to-play, global header, lab-hub header ("🤖 AI Research Laboratory"), and glowing
   rounded-frame hotspots with lock/check badges (`hotspot.tsx`). `PuzzleShell` header now shows the
   Glitch mascot avatar chip.
7. **Bug fixes** (2026-07-14) — `markSolved` no longer drops `p1FirstRunCompleted` from the saved
   snapshot (maze re-forced its dead-end after reload); P4 now restores its saved state after mount
   (no hydration mismatch) and discards a stale "success" left behind by a global Reset Progress
   (game is replayable again); stale keypad description in `content/puzzles/index.json` corrected;
   fixed build-breaking `PuzzleShell` import + unquoted `keypad` key in `puzzles/[id]/page.tsx`.
8. **README.md added** with the local-run workflow (dev on port 5000, hot reload). NOTE: never run
   `next build` while the dev server is running — they share `.next/` and it corrupts the dev CSS.
9. **Liz's feedback round 1 applied** (2026-07-21, "Glitch Feedback" doc): invisible START overlay
   (artwork's painted button is the visual); intro bubbles all one style; maze triggers from the
   right-wall grid panel, Final Console from the small keypad next to the door (robot/door hotspots
   removed); hotspots have no labels/"!" badges — unsolved = transparent blue + name/description
   tooltip, solved = inactive transparent grey + colored-digit tooltip, keypad inactive until Fact
   or Fiction; all puzzles except keypad unlocked from the start (p4 `requires` removed); puzzle
   pages compacted (concept/mission callouts moved to the reward screen); Bad Data intro split into
   two pages + Check Results ↔ Try Again swap; post-solve flow: solution info → Next →
   "Congratulations / Your Reward is <colored digit>" → Return to Lab; hub prefetches all routes.

## Keypad config (easy to change)

The clue scheme + code live at the top of `src/components/puzzle/P5FinalConsole.tsx` in the
`CLUES` array. Currently: **Green 2, Blue 4, Red 6 → code "246"** (entered in that order).
Change `CLUES` (order matters) and the displayed clues + correct code update automatically.

## Open decisions (need sign-off from Liz / project owner)

1. **Source of truth.** There are TWO builds of this game: this **Replit/Next.js app** and an older
   **Figma prototype** (`video-tree-33609425.figma.site`, referenced by the facilitator guide).
   They have different puzzle order/mechanics. Most of Liz's original change-notes were written
   against the Figma version and don't map onto this code. Confirm this Replit/Next.js app is the
   official build going forward. (The most recent link shared was the Replit one.)
2. **Keypad code + clue scheme** — confirm/adjust the `CLUES` values above.
3. **Prompt puzzle difficulty** — `P3PromptAssembly` reveals only ONE wrong slot per submission,
   with cryptic in-character error messages. Decide whether to make feedback clearer for kids.
4. **Maze first-run difficulty** — the RL maze forces a dead-end on the first run by design; decide
   if that's too punishing for the age group.
5. **Facilitator guide answer key** is still a placeholder (that's a separate doc, not in this repo).

## Workflow & deployment

- **Deploy target: Vercel** (auto-detects Next.js; connect the GitHub repo → push = auto-deploy).
  Gives a stable shareable link; multiple groups play independently (state is per-browser).
- **Do NOT deploy on Replit** — its package firewall blocked the app's own Next.js version, and its
  managed-run/preview was unreliable. Replit was abandoned in favor of GitHub + Vercel.
- Dev/testing: GitHub Codespaces or local (Windsurf/VS Code) — `npm install && npm run dev`.
