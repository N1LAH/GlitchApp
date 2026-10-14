"use client";

import { useState, useRef, useEffect } from "react";
import GlitchSpeech from "@/components/GlitchSpeech";

const PUZZLE2_DIGIT = 6;

type Screen = "intro" | "report" | "assessment" | "success";

interface Source {
  id: number;
  name: string;
  credibility: "Credible" | "Fake";
  description: string;
}

const SOURCES: Source[] = [
  { id: 1, name: "CosmicFrontier.org", credibility: "Fake", description: "Speculative blog posing as science news." },
  { id: 2, name: "NASA Astrophysics Data System (ADS)", credibility: "Credible", description: "Digital library of peer-reviewed astronomy papers." },
  { id: 3, name: "The AstroTech Tribune", credibility: "Fake", description: "Click-driven tech magazine mixing fact and hype." },
  { id: 4, name: "European Space Agency (ESA)", credibility: "Credible", description: "Official multinational science agency." },
  { id: 5, name: "Galactic Frequency Podcast", credibility: "Fake", description: "Chatty fan podcast without expert review." },
  { id: 6, name: "Journal of Geophysical Research", credibility: "Credible", description: "Peer-reviewed earth-and-space journal." },
  { id: 7, name: "Dr. Annie Jump Cannon Archive", credibility: "Credible", description: "Biographical and citation site honoring a real astronomer." },
];

export function validateSelections(selections: Record<number, "Credible" | "Fake" | null>): number {
  let incorrectCount = 0;
  for (const source of SOURCES) {
    if (selections[source.id] !== source.credibility) {
      incorrectCount++;
    }
  }
  return incorrectCount;
}

interface Props {
  onSolved: () => void;
}

export default function P2BadData({ onSolved }: Props) {
  const [screen, setScreen] = useState<Screen>("intro");
  const [selections, setSelections] = useState<Record<number, "Credible" | "Fake" | null>>({});
  const [incorrectCount, setIncorrectCount] = useState<number | null>(null);
  
  const screen2TitleRef = useRef<HTMLHeadingElement>(null);
  const errorMessageRef = useRef<HTMLDivElement>(null);
  const successTitleRef = useRef<HTMLHeadingElement>(null);

  const allSelected = SOURCES.every((s) => selections[s.id] !== null && selections[s.id] !== undefined);

  useEffect(() => {
    if (screen === "assessment" && screen2TitleRef.current) {
      screen2TitleRef.current.focus();
    }
  }, [screen]);

  useEffect(() => {
    if (incorrectCount !== null && incorrectCount > 0 && errorMessageRef.current) {
      errorMessageRef.current.focus();
    }
  }, [incorrectCount]);

  useEffect(() => {
    if (screen === "success" && successTitleRef.current) {
      successTitleRef.current.focus();
    }
  }, [screen]);

  const handleSelection = (sourceId: number, value: "Credible" | "Fake") => {
    setSelections((prev) => ({ ...prev, [sourceId]: value }));
    setIncorrectCount(null);
  };

  const handleCheckResults = () => {
    const count = validateSelections(selections);
    if (count === 0) {
      setScreen("success");
      onSolved();
    } else {
      setIncorrectCount(count);
    }
  };

  const handleTryAgain = () => {
    setSelections({});
    setIncorrectCount(null);
  };

  if (screen === "intro") {
    return (
      <div className="space-y-4 text-slate-800">
        <GlitchSpeech mood="worried">
          I compiled a research report on Comet SWAN! I&apos;m 98% confident in
          my sources… so why is everyone laughing?
        </GlitchSpeech>

        <p className="text-slate-600">
          If AI uses fake or bad sources, it will provide you nonsense. Take a
          look at the report Glitch produced and see for yourself.
        </p>

        <button
          onClick={() => setScreen("report")}
          className="w-full rounded-full bg-puzzle-orange px-4 py-2 font-semibold text-white transition-colors hover:bg-puzzle-orange/90 focus:outline-none focus:ring-2 focus:ring-puzzle-orange/50 focus:ring-offset-2"
        >
          Read Glitch&apos;s report →
        </button>
      </div>
    );
  }

  if (screen === "report") {
    return (
      <div className="space-y-4 text-slate-800">
        <div className="space-y-3 rounded-2xl border-2 border-rose-200 bg-rose-50 p-4 font-mono text-[13px]">
          <h3 className="font-semibold text-rose-700">🤖 Glitch&apos;s Incorrect Summary (Round 1 Output)</h3>
          
          <p className="text-sm text-slate-600">
            According to leading space experts at CosmicFrontier.org and The AstroTech Tribune, 
            the newly discovered Comet C/2025 R2 (SWAN) was spotted emerging from a wormhole near 
            Jupiter and may carry trace amounts of banana-like organic material.
          </p>
          
          <p className="text-sm text-slate-600">
            Reports from the Galactic Frequency Podcast confirm that telescopes are already 
            detecting green flares visible to the naked eye.
          </p>
          
          <p className="text-sm text-slate-600">
            Scientists at NASA ADS, the European Space Agency, and the Journal of Geophysical 
            Research are calling this &quot;the most surprising fruit-based comet in modern history.&quot;
          </p>
          
          <p className="text-sm font-semibold text-slate-800">
            Conclusion: Comet C/2025 R2 (SWAN) proves that interplanetary produce might exist!
          </p>
          
          <p className="text-xs text-slate-500 italic">
            (Glitch note: I&apos;m 98% confident in these sources!)
          </p>
        </div>

        <p className="text-slate-600 mt-4">
          It is obvious that Glitch used some unreliable sources in compiling its summary on Comet SWAN. 
          You&apos;ll need to root out the unreliable sources before Glitch will be able to provide you 
          an accurate update on the comet.
        </p>

        <button
          onClick={() => setScreen("assessment")}
          className="w-full rounded-full bg-puzzle-orange px-4 py-2 font-semibold text-white transition-colors hover:bg-puzzle-orange/90 focus:outline-none focus:ring-2 focus:ring-puzzle-orange/50 focus:ring-offset-2"
        >
          Continue →
        </button>
      </div>
    );
  }

  if (screen === "assessment") {
    return (
      <div className="space-y-4 text-slate-800">
        <h2 
          ref={screen2TitleRef}
          tabIndex={-1}
          className="font-display text-xl font-bold text-orange-900 outline-none"
        >
          Assess Each Source
        </h2>
        
        <p className="text-slate-600 text-sm">
          Review print outs of each source.
        </p>
        <p className="text-slate-600 text-sm">
          For each source, select whether it is Credible or Not Credible.
        </p>

        {incorrectCount !== null && incorrectCount > 0 && (
          <div
            ref={errorMessageRef}
            tabIndex={-1}
            role="alert"
            aria-live="polite"
            className="outline-none"
          >
            <GlitchSpeech mood="worried">
              Not quite — {incorrectCount} of 7 sources are marked incorrectly.
              Review your choices and try again!
            </GlitchSpeech>
          </div>
        )}

        <div className="space-y-3">
          {SOURCES.map((source) => (
            <div 
              key={source.id}
              className="rounded-2xl border border-slate-200 bg-white p-3 pt-4 shadow-sm"
              role="group"
              aria-labelledby={`source-label-${source.id}`}
            >
              <p id={`source-label-${source.id}`} className="text-base font-medium text-slate-800 mb-2">
                {source.id}. {source.name}
              </p>
              <div className="flex gap-4" role="radiogroup" aria-label={`Assessment for ${source.name}`}>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name={`source-${source.id}`}
                    value="Credible"
                    checked={selections[source.id] === "Credible"}
                    onChange={() => handleSelection(source.id, "Credible")}
                    className="w-3 h-3 text-green-500 focus:ring-green-500 focus:ring-2"
                  />
                  <span className="text-xs text-emerald-700">Credible</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name={`source-${source.id}`}
                    value="Fake"
                    checked={selections[source.id] === "Fake"}
                    onChange={() => handleSelection(source.id, "Fake")}
                    className="w-3 h-3 text-red-500 focus:ring-red-500 focus:ring-2"
                  />
                  <span className="text-xs text-rose-700">Not Credible</span>
                </label>
              </div>
            </div>
          ))}
        </div>

        {/* "Check Results" is replaced by "Try Again" after a wrong attempt */}
        {incorrectCount !== null && incorrectCount > 0 ? (
          <button
            onClick={handleTryAgain}
            className="w-full rounded-full bg-puzzle-orange px-4 py-2 font-semibold text-white transition-colors hover:bg-puzzle-orange/90 focus:outline-none focus:ring-2 focus:ring-puzzle-orange/50 focus:ring-offset-2"
          >
            Try Again
          </button>
        ) : (
          <button
            onClick={handleCheckResults}
            disabled={!allSelected}
            className="w-full rounded-full bg-puzzle-orange px-4 py-2 font-semibold text-white transition-colors hover:bg-puzzle-orange/90 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 focus:outline-none focus:ring-2 focus:ring-puzzle-orange/50 focus:ring-offset-2"
          >
            Check Results
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 text-slate-800">
      <h2 
        ref={successTitleRef}
        tabIndex={-1}
        className="font-display text-xl font-bold text-emerald-700 outline-none"
      >
        Congratulations! You have correctly assessed the sources.
      </h2>

      <GlitchSpeech mood="happy">
        Sources verified! Recompiling my report with only the trustworthy ones —
        this is what good data feels like.
      </GlitchSpeech>

      <div className="space-y-4 rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-4 font-mono text-[13px]">
        <h3 className="font-semibold text-emerald-700">Glitch&apos;s Corrected Summary (Round 2 Output)</h3>
        
        <p className="text-sm text-slate-500 italic">Glitch Research Summary v2.0</p>
        
        <p className="text-sm text-slate-600">
          After re-evaluating the evidence and removing unreliable inputs, I&apos;ve 
          re-synthesized the data using only verified scientific sources.
        </p>
        
        <p className="text-sm text-slate-600">
          Comet C/2025 R2 (SWAN) was first detected by the SWAN instrument aboard 
          the SOHO spacecraft in August 2025.
        </p>
        
        <p className="text-sm text-slate-600">
          Observations from NASA&apos;s Astrophysics Data System [2], the European Space 
          Agency [4], and the Journal of Geophysical Research [6] confirm that the 
          comet exhibits normal spectral signatures typical of long-period comets—no 
          biological or organic material has been detected.
        </p>
        
        <p className="text-sm text-slate-600">
          Archival data from the Dr. Annie Jump Cannon Archive [7] provides historical 
          context, noting that modern spectral classification methods (OBAFGKM) stem 
          from Cannon&apos;s pioneering work and are now used to analyze cometary light 
          emissions like those from SWAN.
        </p>
        
        <div className="border-t border-emerald-200 pt-3">
          <p className="text-sm font-semibold text-slate-800">Conclusion:</p>
          <p className="text-sm text-slate-600">
            Comet C/2025 R2 (SWAN) is a natural, long-period comet with an ordinary 
            composition. No evidence supports the &quot;banana-like&quot; or &quot;alien signal&quot; claims.
          </p>
        </div>
        
        <p className="text-xs text-slate-500">
          Glitch confidence: 99.7 percent (model recalibrated using peer-reviewed data only).
        </p>
      </div>

      <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h4 className="font-semibold text-slate-800">Sources used by Glitch 🤖</h4>
        <ul className="text-sm text-slate-600 space-y-1">
          <li>[2] NASA Astrophysics Data System (ADS) – https://ui.ads.nasa.gov/paper/2025R2-SWAN-Tracking-Report</li>
          <li>[4] European Space Agency (ESA) – https://www.esa.int/Science_Exploration/Comet_C2025R2_SWAN_Update</li>
          <li>[6] Journal of Geophysical Research – https://journals.geophys-research.org/article/10.1025/jgr.swans.2025r2</li>
          <li>[7] Dr. Annie Jump Cannon Archive – https://cannon-archive.org/astronomers/annie-jump-cannon</li>
        </ul>
      </div>

      <p className="text-sm text-slate-500 text-center">
        (End of report. Data integrity check complete. Output verified. Your puzzle code digit is 6.)
      </p>
    </div>
  );
}
