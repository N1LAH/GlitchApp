# Glitch Lab Online

## Overview
A Next.js 14 TypeScript application with Tailwind CSS and shadcn/ui components for interactive coding challenges and puzzles.

## Project Structure
```
glitch/
├── src/
│   ├── app/              # Next.js app directory
│   │   ├── layout.tsx    # Root layout
│   │   ├── page.tsx      # Homepage
│   │   └── globals.css   # Global styles
│   ├── components/
│   │   └── ui/           # shadcn/ui components
│   └── lib/
│       └── utils.ts      # Utility functions
├── content/
│   ├── episodes/         # Episode content
│   └── puzzles/          # Puzzle content
├── tests/
│   ├── unit/             # Unit tests
│   └── e2e/              # End-to-end tests
└── public/
    └── assets/
        └── images/       # Static images
```

## Technology Stack
- **Framework**: Next.js 14
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui with Radix UI primitives
- **State Management**: Zustand with localStorage persistence
- **Testing**: Vitest with jsdom
- **Code Quality**: ESLint, Prettier

## Configuration
- Absolute imports configured with `@/*` path mapping
- TypeScript strict mode enabled
- ESLint with Prettier integration
- Tailwind CSS with custom theme variables

## Available Components
- Button
- Card
- Dialog
- Tooltip
- Alert
- Badge
- Switch
- Input
- Slider

## Development
- Run: `npm run dev` (starts on port 5000)
- Build: `npm run build`
- Test: `npm test` (runs Vitest unit tests)
- Lint: `npm run lint`
- Format: `npm run format`

## Environment Variables
Copy `.env.example` to `.env.local` and configure as needed.

## Puzzle System Architecture
The application features a reusable puzzle engine with the following components:

### Core Components
- **PuzzleHost** (`src/components/puzzle/PuzzleHost.tsx`): Wrapper component that handles:
  - Dependency checking and puzzle locking
  - Progress tracking and state management
  - Providing render props to child puzzle components
  - Starting the run timer on first puzzle visit

- **PuzzleHUD** (`src/components/puzzle/PuzzleHUD.tsx`): Header UI displaying:
  - Puzzle title and status badge (Available/Solved/Locked)
  - Hint button with dialog

### Implemented Puzzles
1. **P1: Reinforcement Maze** (`src/components/puzzle/P1ReinforcementMaze.tsx`)
   - 8×8 grid navigation using Manhattan distance feedback
   - Keyboard controls: Arrow keys + WASD
   - Pure logic module: `src/components/puzzle/p1-logic.ts`
   - Comprehensive test coverage: `tests/unit/p1-logic.test.ts` (22 tests)
   - Grants digit: 4

2. **P2: Bad Data** (`src/components/puzzle/P2BadData.tsx`)
   - Source credibility assessment (7 sources: 3 fake, 4 credible)
   - 3-screen flow: Intro → Assessment → Success
   - Validation test coverage: `src/components/puzzle/P2BadData.test.tsx`
   - Grants digit: 6

3. **P3: Prompt Assembly** (`src/components/puzzle/P3PromptAssembly.tsx`)
   - Drag-and-drop prompt building with 6 typed slots
   - HTML5 DnD + full keyboard accessibility
   - Priority-based failure messaging, tiered hints, almost-correct detection
   - Pure validation function: `validateAssembly()`
   - Test coverage: `src/components/puzzle/P3PromptAssembly.test.tsx`
   - Grants digit: 2

### Progress Tracking
- Zustand store (`src/store/progress.ts`) with localStorage persistence
- Tracks: solved puzzles, collected digits, start/finish timestamps
- Timer functionality: Records `startedAt` on /start, `finishedAt` when final puzzle solved

## Testing
- **Framework**: Vitest with jsdom environment
- **Configuration**: `vitest.config.mts`
- **Test Coverage**: 
  - Unit tests for puzzle logic (move, feedback, goal detection)
  - Edge cases for grid boundaries and distance calculations

## Recent Changes
- **2026-02-11**: Implemented P3 Prompt Assembly with drag-and-drop, failure messaging, and validation tests
- **2026-02-11**: Implemented P2 Bad Data with source credibility assessment and validation tests
- **2025-11-05**: Implemented P1 Reinforcement Maze with full test coverage
- **2025-11-05**: Removed live timer UI from puzzles (timing persists in background)
- **2025-11-05**: Set up Vitest testing framework
- **2025-11-04**: Initial project setup with Next.js 14, TypeScript, Tailwind CSS, and shadcn/ui components
