export const ISRAEL_TZ = "Asia/Jerusalem";

/** Returns YYYY-MM-DD for a given date in Israel timezone. */
export function toIsraelDateKey(date: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: ISRAEL_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
  return parts;
}

/** Israel timezone offset (ms) at a given instant, DST-aware. */
export function israelOffsetMs(date: Date = new Date()): number {
  const asIsrael = new Date(date.toLocaleString("en-US", { timeZone: ISRAEL_TZ }));
  const asUtc = new Date(date.toLocaleString("en-US", { timeZone: "UTC" }));
  return asIsrael.getTime() - asUtc.getTime();
}

/** Converts an Israel wall-clock date/time (YYYY-MM-DD + HH:MM) to a UTC epoch (ms). */
export function israelWallClockToUtc(dateKey: string, hh: number, mm: number): number {
  const pad = (n: number) => String(n).padStart(2, "0");
  const guess = Date.parse(`${dateKey}T${pad(hh)}:${pad(mm)}:00Z`);
  return guess - israelOffsetMs(new Date(guess));
}

/** Date key offset by N days from a base key (default: today in Israel time). */
export function dateKeyOffset(days: number, baseKey?: string): string {
  const d = baseKey ? new Date(`${baseKey}T12:00:00Z`) : new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return toIsraelDateKey(d);
}

/** Formats an ISO timestamp to HH:mm in Israel time. */
export function formatIsraelTime(iso: string): string {
  return new Intl.DateTimeFormat("he-IL", {
    timeZone: ISRAEL_TZ,
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

/** Formats an ISO timestamp to a readable Hebrew date. */
export function formatIsraelDate(iso: string): string {
  return new Intl.DateTimeFormat("he-IL", {
    timeZone: ISRAEL_TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(iso));
}
