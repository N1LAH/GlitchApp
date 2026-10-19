"use client";

import { useEffect, useState } from "react";
import { useProgress } from "@/store/progress";
import { allPuzzles } from "@/lib/puzzles";
import { CLUES, codeFor } from "@/lib/clues";
import { DEV_TOOLS_KEY } from "@/components/DevToolbar";
import { useRouter } from "next/navigation";

/**
 * Developer / facilitator console. Deliberately utilitarian (not game-styled)
 * so it's obvious you've left the player experience. Players never see this
 * unless they navigate to /dev on purpose.
 */
export default function DevConsolePage() {
  const router = useRouter();
  const progress = useProgress();
  const { solved, codeDigits, tokens, startedAt, timerStartedAt, finishedAt, markSolved, reset } =
    progress;
  const [hydrated, setHydrated] = useState(false);
  const [toolbarOn, setToolbarOn] = useState(false);

  useEffect(() => {
    setHydrated(true);
    setToolbarOn(localStorage.getItem(DEV_TOOLS_KEY) === "1");
  }, []);

  const toggleToolbar = () => {
    const next = !toolbarOn;
    setToolbarOn(next);
    if (next) localStorage.setItem(DEV_TOOLS_KEY, "1");
    else localStorage.removeItem(DEV_TOOLS_KEY);
    // DevToolbar reads the flag on mount — reload so it picks the change up.
    window.location.reload();
  };

  const routes = [
    ["/start", "Title screen"],
    ["/", "Lab hub"],
    ["/episodes", "Mission log"],
    ["/how-to-play", "How to play"],
    ["/end", "End screen"],
    ...allPuzzles.map((p) => [`/puzzles/${p.id}`, p.title] as [string, string]),
  ];

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 font-mono text-sm text-slate-300 sm:px-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="border-b border-slate-800 pb-4">
          <h1 className="text-xl font-bold text-yellow-400">
            ⚙ Glitch Lab — Dev / Facilitator Console
          </h1>
          <p className="mt-1 text-slate-500">
            Player experience lives at{" "}
            <a href="/" className="text-sky-400 underline">
              /
            </a>
            . Nothing here is linked from the game.
          </p>
        </header>

        <section className="rounded-lg border border-slate-800 bg-slate-900 p-4">
          <h2 className="mb-3 font-bold text-slate-100">Session state</h2>
          {hydrated ? (
            <ul className="space-y-1">
              <li>
                door code:{" "}
                <span className="text-emerald-400">{codeFor(codeDigits)}</span>{" "}
                <span className="text-slate-500">
                  ({CLUES.map((c) => `${c.color} ${codeDigits[c.puzzleId]}`).join(", ")})
                </span>
              </li>
              <li>
                tokens:{" "}
                <span className="text-emerald-400">
                  {Object.keys(tokens).filter((t) => tokens[t]).join(", ") || "—"}
                </span>
              </li>
              <li>
                startedAt:{" "}
                <span className="text-emerald-400">
                  {startedAt ? new Date(startedAt).toLocaleTimeString() : "—"}
                </span>
              </li>
              <li>
                timer started (first puzzle opened):{" "}
                <span className="text-emerald-400">
                  {timerStartedAt ? new Date(timerStartedAt).toLocaleTimeString() : "—"}
                </span>
              </li>
              <li>
                finishedAt:{" "}
                <span className="text-emerald-400">
                  {finishedAt ? new Date(finishedAt).toLocaleTimeString() : "—"}
                </span>
              </li>
            </ul>
          ) : (
            <p>loading…</p>
          )}
        </section>

        <section className="rounded-lg border border-slate-800 bg-slate-900 p-4">
          <h2 className="mb-3 font-bold text-slate-100">Puzzles</h2>
          <ul className="space-y-2">
            {allPuzzles.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2 last:border-0 last:pb-0"
              >
                <span>
                  {hydrated && solved[p.id] ? (
                    <span className="text-emerald-400">✓</span>
                  ) : (
                    <span className="text-slate-600">○</span>
                  )}{" "}
                  {p.title}
                  {p.grants?.digit && (
                    <span className="text-slate-500"> → digit {codeDigits[p.id]}</span>
                  )}
                  {p.grants?.token && (
                    <span className="text-slate-500"> → {p.grants.token}</span>
                  )}
                </span>
                <span className="flex gap-2">
                  <button
                    onClick={() => router.push(`/puzzles/${p.id}`)}
                    className="rounded border border-slate-700 px-2 py-1 text-xs hover:bg-slate-800"
                  >
                    open
                  </button>
                  {hydrated && !solved[p.id] && (
                    <button
                      onClick={() => markSolved({ id: p.id, token: p.grants?.token })}
                      className="rounded border border-yellow-700 px-2 py-1 text-xs text-yellow-400 hover:bg-yellow-950"
                    >
                      mark solved
                    </button>
                  )}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() =>
                allPuzzles.forEach((p) => markSolved({ id: p.id, token: p.grants?.token }))
              }
              className="rounded bg-yellow-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-yellow-500"
            >
              Unlock all
            </button>
            <button
              onClick={() => {
                if (confirm("Reset ALL progress for this browser?")) reset();
              }}
              className="rounded bg-rose-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-600"
            >
              Reset all progress
            </button>
          </div>
        </section>

        <section className="rounded-lg border border-slate-800 bg-slate-900 p-4">
          <h2 className="mb-3 font-bold text-slate-100">Floating dev toolbar</h2>
          <p className="mb-3 text-slate-500">
            Shows the ⚙ Dev bubble on every page of this browser session
            (persists until turned off here).
          </p>
          <button
            onClick={toggleToolbar}
            className={`rounded px-3 py-1.5 text-xs font-bold text-white ${
              toolbarOn
                ? "bg-emerald-700 hover:bg-emerald-600"
                : "bg-slate-700 hover:bg-slate-600"
            }`}
          >
            {toolbarOn ? "ON — click to disable" : "OFF — click to enable"}
          </button>
        </section>

        <section className="rounded-lg border border-slate-800 bg-slate-900 p-4">
          <h2 className="mb-3 font-bold text-slate-100">Jump to route</h2>
          <ul className="grid gap-1 sm:grid-cols-2">
            {routes.map(([href, label]) => (
              <li key={href}>
                <a href={href} className="text-sky-400 underline">
                  {href}
                </a>{" "}
                <span className="text-slate-500">{label}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
