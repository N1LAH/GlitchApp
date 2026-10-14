"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProgress } from "@/store/progress";

/**
 * One-step fresh game: wipes this browser's session and lands on the title
 * screen. Bookmark <site>/new to restart the game in a single click —
 * handy between groups on event day.
 */
export default function NewGamePage() {
  const router = useRouter();
  const reset = useProgress((s) => s.reset);

  useEffect(() => {
    reset(); // clears progress store + localStorage + session cookie
    localStorage.removeItem("glitch_p4_v1"); // Fact or Fiction's own saved state
    router.replace("/start");
  }, [reset, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-glitch-teal to-glitch-teal-deep">
      <p className="font-display text-xl font-bold text-glitch-cream">
        Starting a new game…
      </p>
    </div>
  );
}
