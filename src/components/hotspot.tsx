"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type HotspotState = "available" | "solved" | "inactive";

export interface HotspotProps {
  id: string;
  /** Accessible name (no visible label is rendered). */
  label: string;
  /** Center position, in percent of the scene. */
  x: number;
  y: number;
  /** Frame size, in percent of the scene. */
  width?: number;
  height?: number;
  /**
   * available — clickable, transparent blue glow.
   * solved    — transparent grey; tooltip shows the reward; still clickable to replay.
   * inactive  — not clickable (keypad before the other puzzles), lock badge.
   */
  state?: HotspotState;
  /** Hover/focus tooltip content. */
  tooltip?: React.ReactNode;
  onActivate?: () => void;
}

const Hotspot: React.FC<HotspotProps> = ({
  id,
  label,
  x,
  y,
  width = 16,
  height = 22,
  state = "available",
  tooltip,
  onActivate,
}) => {
  const clickable = state !== "inactive";

  const activate = () => {
    if (clickable) onActivate?.();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      activate();
    }
  };

  const frameTone =
    state === "solved"
      ? "border-slate-300/60 bg-slate-500/25 cursor-pointer"
      : state === "inactive"
        ? "border-slate-300/40 bg-slate-400/10 cursor-not-allowed"
        : "border-sky-300/90 bg-sky-400/10 shadow-[0_0_18px_rgba(56,189,248,0.55)] animate-pulse cursor-pointer";

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            id={id}
            role="button"
            tabIndex={0}
            aria-label={label}
            aria-disabled={!clickable}
            className={cn(
              "absolute -translate-x-1/2 -translate-y-1/2 rounded-2xl border-2",
              "transition-all duration-200",
              clickable && "hover:scale-105 focus:scale-105",
              "focus:outline-none focus:ring-4 focus:ring-sky-300/60 focus:ring-offset-2",
              frameTone
            )}
            style={{
              left: `${x}%`,
              top: `${y}%`,
              width: `${width}%`,
              height: `${height}%`,
            }}
            onClick={activate}
            onKeyDown={handleKeyDown}
          >
            {state === "inactive" && (
              <span
                className="absolute -top-3 -right-3 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-500 text-white shadow-md"
                aria-hidden
              >
                <Lock className="h-3.5 w-3.5" />
              </span>
            )}
            <span className="sr-only">{label}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="max-w-xs text-sm">{tooltip ?? label}</div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

Hotspot.displayName = "Hotspot";

export default Hotspot;
