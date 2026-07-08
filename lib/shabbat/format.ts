/** Formats a date in the visitor timezone for Hebrew UI copy. */
export function formatShabbatTime(locale: string, timezone: string, date: Date): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: timezone,
    }).format(date);
  } catch {
    return date.toLocaleString("he-IL");
  }
}

/** Short time label for banners and indicators. */
export function formatShabbatClock(locale: string, timezone: string, date: Date): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: timezone,
    }).format(date);
  } catch {
    return date.toTimeString().slice(0, 5);
  }
}
