export type ShabbatLocationMode = "api" | "none";
export type ShabbatMinhag = "default" | "chabad" | "jerusalem40" | "custom";
export type ShabbatStatus = "loading" | "inactive" | "approaching" | "active";

export interface ShabbatLocation {
  latitude: number;
  longitude: number;
  timezone: string;
  source: "ipapi" | "default";
}

export interface ShabbatTimes {
  candleLighting: Date;
  havdalah: Date;
}

export interface ShabbatConfig {
  enabled: boolean;
  location: ShabbatLocationMode;
  minhag: ShabbatMinhag;
  havdalahMinutes: number;
  warningMinutes: number;
  locale: string;
  cacheKey: string;
  defaultLocation: ShabbatLocation;
}

export interface ShabbatState {
  status: ShabbatStatus;
  location: ShabbatLocation | null;
  times: ShabbatTimes | null;
}

export type ShabbatListener = (state: ShabbatState) => void;
