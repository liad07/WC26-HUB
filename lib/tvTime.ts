import type { TvProgram } from "@/types/tv";

const DEFAULT_DURATION = 2 * 60 * 60 * 1000;

/** Index of the programme airing at `now` (epoch ms), or -1 — midnight-safe via real timestamps. */
export function currentProgramIndex(programs: Pick<TvProgram, "startTs" | "endTs">[], now: number): number {
  for (let i = 0; i < programs.length; i++) {
    const start = programs[i].startTs;
    const end = programs[i].endTs ?? start + DEFAULT_DURATION;
    if (now >= start && now < end) return i;
  }
  return -1;
}
