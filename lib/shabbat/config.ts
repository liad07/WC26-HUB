import type { ShabbatConfig, ShabbatLocationMode, ShabbatMinhag } from "./types";

const ISRAEL_DEFAULT: ShabbatConfig["defaultLocation"] = {
  latitude: 31.7683,
  longitude: 35.2137,
  timezone: "Asia/Jerusalem",
  source: "default",
};

/** Reads Shabbat guard settings from public env vars. */
export function getShabbatConfig(): ShabbatConfig {
  return {
    enabled: process.env.NEXT_PUBLIC_SHABBAT_GUARD_ENABLED !== "false",
    location: (process.env.NEXT_PUBLIC_SHABBAT_LOCATION as ShabbatLocationMode) || "prompt-then-api",
    onDeny: process.env.NEXT_PUBLIC_SHABBAT_ON_DENY === "none" ? "none" : "api",
    minhag: (process.env.NEXT_PUBLIC_SHABBAT_MINHAG as ShabbatMinhag) || "default",
    havdalahMinutes: Number(process.env.NEXT_PUBLIC_SHABBAT_HAVDALAH_MINUTES || "40"),
    warningMinutes: Number(process.env.NEXT_PUBLIC_SHABBAT_WARNING_MINUTES || "60"),
    locale: process.env.NEXT_PUBLIC_SHABBAT_LOCALE || "he-IL",
    cacheKey: "shabbat-guard-cache-v3",
    defaultLocation: ISRAEL_DEFAULT,
  };
}
