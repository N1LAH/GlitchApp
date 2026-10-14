"use client";

import { ReactNode } from "react";

export type GlitchMood = "neutral" | "happy" | "worried" | "story";

const MOOD_BADGE: Record<GlitchMood, string | null> = {
  neutral: null,
  happy: "✨",
  worried: "⚠️",
  story: null, // warm amber bubble, no badge — used for the intro narration
};

/**
 * Glitch talking: mascot avatar + speech bubble. Use for in-character status,
 * feedback, and story beats so Glitch feels present throughout the game.
 */
export default function GlitchSpeech({
  children,
  mood = "neutral",
  className = "",
}: {
  children: ReactNode;
  mood?: GlitchMood;
  className?: string;
}) {
  const badge = MOOD_BADGE[mood];

  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <span className="relative flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-600 shadow-md">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/images/glitch-mascot.webp"
          alt=""
          aria-hidden
          className="h-9 w-9 object-contain"
          style={{ imageRendering: "pixelated" }}
        />
      </span>
      <div
        className={`relative flex-1 rounded-2xl rounded-tl-sm border p-3 text-sm shadow-sm ${
          mood === "happy"
            ? "border-emerald-200 bg-emerald-50 text-emerald-900"
            : mood === "worried" || mood === "story"
              ? "border-amber-200 bg-amber-50 text-amber-900"
              : "border-slate-200 bg-white text-slate-700"
        }`}
      >
        <p className="mb-0.5 text-[11px] font-bold uppercase tracking-[0.18em] text-purple-600">
          Glitch {badge && <span aria-hidden>{badge}</span>}
        </p>
        <div>{children}</div>
      </div>
    </div>
  );
}
