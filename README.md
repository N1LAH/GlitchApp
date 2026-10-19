# Glitch: The STEM Challenge

An escape-room-style web game teaching kids (12–16) how AI works. Players help a
glitchy lab AI ("Glitch") by solving five AI-themed puzzles to collect digits and
unlock the lab door.

## Run it locally (no deployment needed)

```bash
npm install    # first time only
npm run dev    # starts on http://localhost:5000
```

Open http://localhost:5000 in your browser (in GitHub Codespaces, use the
**Ports** tab → port 5000 → globe icon). Every file you save hot-reloads
instantly — no restart needed.

Progress is saved per-browser in `localStorage`, so each player/device gets an
independent session. Sessions older than 12 hours are discarded automatically.
To wipe a session between groups, open **`/new`** (bookmark it) or use `/dev`.

## Two ways in: player vs. dev

One running server gives you both perspectives:

| Avenue | URL | What you get |
| ------ | --- | ------------ |
| **Player** | http://localhost:5000 | The pure game: title screen → story intro → lab. No dev clutter. |
| **Dev / facilitator** | http://localhost:5000/dev | Utilitarian console: session state, mark any puzzle solved, unlock all, reset, jump to any route, toggle the floating ⚙ Dev toolbar. |

Nothing in the game links to `/dev` — players won't stumble into it.

To have the floating ⚙ Dev toolbar (unlock/reset from any page) on from the
start, either enable it on `/dev`, or launch with:

```bash
npm run dev:tools   # same server, dev toolbar + demo skip buttons visible
```

### Useful commands

| Command         | What it does                                   |
| --------------- | ---------------------------------------------- |
| `npm run dev`   | Dev server with hot reload (port 5000)         |
| `npm test`      | Unit tests (Vitest)                            |
| `npx tsc --noEmit` | Type check                                  |
| `npm run build` | Production build — **stop the dev server first** (they share `.next/`) |

## Game flow

Start (`/start`) → Lab hub (`/`) → Episodes (`/episodes`) →
Maze → Bad Data → Prompt Precision → Fact or Fiction → Final Console keypad →
End screen. The color-clue scheme lives in `src/lib/clues.ts` (color order Green,
Blue, Red — put it on the handout). Digits are randomized per session; `/dev`
shows the current code.

## Deploying (later)

Push to GitHub `main` → Vercel auto-builds and deploys. A failed build keeps the
previous deploy live, so always make sure `npm run build` passes before pushing.
See `CLAUDE.md` for the full project handoff.
