"use client";

import { useState } from "react";
import { useProgress } from "@/store/progress";
import { useRouter } from "next/navigation";
import GlitchSpeech from "@/components/GlitchSpeech";

/** Story beats shown after START, before entering the lab. */
const INTRO_BEATS: string[] = [
  "Oh no — you're awake! While you were touring the lab, my systems glitched and the security door sealed us in.",
  "My AI training data is scrambled. I can't remember how to learn, which sources to trust, or even what's true anymore…",
  "Help me fix each system by solving the puzzles hidden in objects around the lab. Each one you repair reveals a colored digit.",
  "Collect all three digits, check your team handout for the color order, and punch them into the keypad by the door. Ready to think your way out?",
];

export default function StartPage() {
  const { startRun } = useProgress();
  const router = useRouter();
  // null = title screen; 0..n = story beat index
  const [beat, setBeat] = useState<number | null>(null);

  const enterLab = () => {
    startRun();
    router.push("/");
  };

  const lastBeat = beat !== null && beat === INTRO_BEATS.length - 1;

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-b from-glitch-teal to-glitch-teal-deep p-4 sm:p-8">
      <div className="w-full max-w-5xl">
        {/* The artwork IS the title screen — render it clean, no extra layers. */}
        <div className="relative aspect-[3/2] w-full overflow-hidden rounded-[28px] border-8 border-glitch-teal-deep shadow-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/images/start-bg.webp"
            alt="Glitch: The STEM Challenge"
            className="absolute inset-0 h-full w-full select-none object-cover"
            draggable={false}
          />

          {beat === null ? (
            /* Invisible click target over the painted START button — the
               artwork's own button is the visual, so nothing we draw can
               mismatch it. */
            <button
              onClick={() => setBeat(0)}
              aria-label="Start"
              className="absolute rounded-full bg-transparent transition-transform hover:scale-105 focus:outline-none focus-visible:ring-4 focus-visible:ring-glitch-cream/70"
              style={{
                left: "59.8%",
                top: "62%",
                width: "17.7%",
                height: "9%",
              }}
            />
          ) : (
            /* Story intro: dim the art, Glitch tells you what happened */
            <div className="absolute inset-0 flex items-center justify-center bg-glitch-teal-deep/80 p-4 backdrop-blur-[2px] sm:p-10">
              <div className="w-full max-w-xl rounded-[24px] bg-white p-5 shadow-2xl sm:p-6">
                <GlitchSpeech mood="story">
                  <span className="text-base">{INTRO_BEATS[beat]}</span>
                </GlitchSpeech>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <div className="flex gap-1.5" aria-hidden>
                    {INTRO_BEATS.map((_, i) => (
                      <span
                        key={i}
                        className={`h-2 w-2 rounded-full ${
                          i <= beat ? "bg-glitch-teal" : "bg-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    {!lastBeat && (
                      <button
                        onClick={enterLab}
                        className="rounded-full px-4 py-2 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300"
                      >
                        Skip intro
                      </button>
                    )}
                    <button
                      onClick={() => (lastBeat ? enterLab() : setBeat(beat + 1))}
                      className="rounded-full bg-glitch-teal px-6 py-2 font-display font-bold text-white shadow-md transition-transform hover:scale-105 focus:outline-none focus-visible:ring-4 focus-visible:ring-glitch-teal/40"
                    >
                      {lastBeat ? "Enter the Lab →" : "Next"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
