/** Elapsed time as h:mm:ss. */
export function formatTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const mm = Math.floor((totalSeconds % 3600) / 60);
  const ss = totalSeconds % 60;
  return `${h}:${mm.toString().padStart(2, "0")}:${ss.toString().padStart(2, "0")}`;
}
