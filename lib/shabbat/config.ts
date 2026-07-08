import type { ShabbatConfig, ShabbatLocationMode, ShabbatMinhag } from "./types";

const ISRAEL_DEFAULT: ShabbatConfig["defaultLocation"] = {
  latitude: 31.7683,
  longitude: 35.2137,
  timezone: "Asia/Jerusalem",
  source: "default",
};

function resolveLocationMode(raw: string | undefined): ShabbatLocationMode {
  if (raw === "none") return "none";
  return "api";
}

/** Reads Shabbat guard settings from public env vars. */
export function getShabbatConfig(): ShabbatConfig {
  return {
    enabled: process.env.NEXT_PUBLIC_SHABBAT_GUARD_ENABLED !== "false",
    location: resolveLocationMode(process.env.NEXT_PUBLIC_SHABBAT_LOCATION),
    minhag: (process.env.NEXT_PUBLIC_SHABBAT_MINHAG as ShabbatMinhag) || "default",
    havdalahMinutes: Number(process.env.NEXT_PUBLIC_SHABBAT_HAVDALAH_MINUTES || "40"),
    warningMinutes: Number(process.env.NEXT_PUBLIC_SHABBAT_WARNING_MINUTES || "60"),
    locale: process.env.NEXT_PUBLIC_SHABBAT_LOCALE || "he-IL",
    cacheKey: "shabbat-guard-cache-v3",
    defaultLocation: ISRAEL_DEFAULT,
  };
}
