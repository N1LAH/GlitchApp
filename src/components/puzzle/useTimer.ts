"use client";

import { useEffect, useRef, useState } from "react";

export function useTimer(active: boolean, baselineSeconds: number = 0) {
  const [elapsed, setElapsed] = useState(baselineSeconds);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (!active) {
      setElapsed(baselineSeconds);
      return;
    }
    const start = performance.now();
    const tick = (t: number) => {
      setElapsed(baselineSeconds + Math.floor((t - start) / 1000));
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [active, baselineSeconds]);

  return { elapsed };
}
