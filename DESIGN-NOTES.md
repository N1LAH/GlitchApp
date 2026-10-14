# DESIGN-NOTES.md — Matching the Figma look

Goal: bring **this Next.js app's visual design** up to the polish of the Figma prototype
(`https://video-tree-33609425.figma.site/`). This is about the **look & feel**, NOT the puzzle
mechanics — the two builds have different puzzles (e.g. Figma's reinforcement-learning puzzle is a
"Space Race Time Trial" reward-function task; ours is a maze — keep OUR mechanics).

Observed from the live Figma site on 2026-07-13. Figma Sites doesn't expose clean CSS, so this
describes the design language to reimplement in Tailwind, not exact values.

## The core gap

Our current build is **uniformly dark slate** with rainbow-gradient title text, the default Inter
font, thin-bordered dark cards, and tiny green-dot hotspots. It reads like a developer default.
The Figma build is **warm, illustrated, per-screen themed, and character-driven** — clearly made
for 12–16 year-olds. Below is what to adopt.

## 1. Per-screen theming (biggest visual difference)

Each puzzle has its OWN accent color and a matching **gradient background**, instead of one flat
dark background everywhere:

- Start screen: deep teal/forest green.
- Lab hub: dark navy → purple gradient.
- "Garbage In, Garbage Out" (data) puzzle: warm cream bg, **orange** accent.
- Reinforcement-learning puzzle: **purple/magenta** gradient bg.
- Other puzzles similarly get a distinct hue.

Implementation: give each puzzle a `theme` color in `content/puzzles/index.json` (or a lookup in
`src/lib/puzzles.ts`), and drive the page background gradient + icon chip + CTA color from it.

## 2. Light, card-based puzzle UI (not dark)

Puzzle screens use a **light/warm background** (cream `#FBF3E0`-ish) with a **large white rounded
card** (≈24px radius, soft shadow) holding the content. Inside:

- **Header row:** a rounded-square icon chip in the puzzle's accent color (white glyph) + puzzle
  title, with a pill-shaped outlined **"Return to Lab"** button on the right (back-arrow icon).
- **Concept callout:** a tinted box (accent-tinted bg, accent left border, warning/lightbulb icon)
  teaching the AI concept — e.g. "AI systems are only as good as their data."
- **Character card:** a "Meet Glitch, Your AI Friend" block with Glitch's avatar (purple gradient
  circle + robot glyph), a short description, and a highlighted **"Your Mission:"** box.
- **Primary CTA:** a big solid accent-colored rounded button with a right-arrow
  (e.g. "Help Glitch Learn →").
- Semantic sub-cards where relevant: green-tinted "Maximize" vs red-tinted "Minimize" cards, each
  with an icon. Use green/red intentionally for good/bad.

Contrast with ours: `src/app/puzzles/[id]/page.tsx` + `PuzzleHost.tsx`/`PuzzleHUD.tsx` currently
render a dark `bg-black/30` card with a plain title + status badge + "Hint" button. Rework these
toward the light card + accent header + callout pattern.

## 3. Start screen

Full-bleed **illustrated lab scene** framed like a rounded device/porthole (thick dark bezel).
Big friendly **display title "GLITCH"** (heavy rounded sans, cream), "THE STEM CHALLENGE"
subtitle in spaced caps, a one-line hook ("Locked in the lab with glitchy AI — can you think your
way out?"), a large illustrated **Glitch robot mascot** on the left, and a single cream rounded
**START** button. Ours (`src/app/start/page.tsx`) is a dark card with a bulleted feature list —
replace with this hero treatment.

## 4. Lab hub hotspots

Same lab artwork as ours, but clickable objects are marked with **glowing rounded-rectangle
frames** (soft blue glow) and a small **lock icon** on locked ones — clear "click me" affordance.
Ours uses tiny green dots (`src/components/hotspot.tsx`). Switch to highlighted framed regions +
lock/checkmark state icons. Header: "🤖 AI Research Laboratory" + subtitle
"Click on objects around the lab to uncover the mysteries of artificial intelligence."

## 5. Character & voice

Glitch is a real presence: illustrated mascot on the start screen, a purple-gradient avatar chip
in every puzzle header, and a playful first-person voice in copy
(e.g. "Glitch confidence: 98 percent (credibility model trained on cat memes and Reddit threads.)").
Add the mascot art to `public/assets/` and surface the avatar + Glitch dialogue consistently.

## 6. Typography & components

- **Display font** for titles: a heavy, friendly rounded sans (not plain Inter). Add via
  `next/font` (e.g. Poppins / Baloo / Fredoka) for headings; keep a clean sans for body.
- Deliberate **monospace** for "AI research report / terminal" content blocks (the Figma research
  summary uses mono inside a bordered box) — we can reuse for in-character system text.
- Everything is **rounded and soft**: ~16–24px radii, soft shadows, generous padding, tinted
  callout boxes with icons. Replace thin `border-white/10` dark cards accordingly.
- **Emoji/icon system** used throughout for warmth and scannability (🤖 🎯 🚀 📈 📉).

## 7. Suggested Tailwind theme additions

Extend `tailwind.config.ts` with a warm palette and per-puzzle accents, e.g.:
`glitch.cream`, `glitch.teal`, and accent scales for orange / purple / green / red / blue. Then
build reusable components: `PuzzleShell` (light card + themed header + Return-to-Lab),
`ConceptCallout`, `GlitchCharacterCard`, `MissionBox`, `PrimaryCTA`, themed `Hotspot`.

## What NOT to change

- Keep our puzzle **mechanics** (maze RL, prompt-assembly, working keypad `P5FinalConsole.tsx`,
  Zustand progress) — the Figma is only the visual reference.
- Keep the dependency fixes (Next 14.2.33; test libs in devDependencies).

## How to reference the Figma live

Open `https://video-tree-33609425.figma.site/` and click START → click objects in the lab to see
each puzzle's themed screen. Match colors/layout per screen.
