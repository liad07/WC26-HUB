import type {
  ShabbatConfig,
  ShabbatListener,
  ShabbatLocation,
  ShabbatState,
  ShabbatTimes,
} from "./types";

interface CachedTimes {
  ts: number;
  in: number;
  out: number;
}

/** Detects Shabbat windows via Hebcal, matching shabbat-guard core behavior. */
export class ShabbatService {
  private readonly config: ShabbatConfig;
  private readonly listeners = new Set<ShabbatListener>();
  private state: ShabbatState = { status: "loading", location: null, times: null };
  private timers: ReturnType<typeof setTimeout>[] = [];
  private active = false;

  constructor(config: ShabbatConfig) {
    this.config = config;
  }

  subscribe(listener: ShabbatListener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  getState(): ShabbatState {
    return this.state;
  }

  start(): void {
    if (!this.config.enabled || this.active) return;
    this.active = true;
    void this.run();
  }

  destroy(): void {
    this.active = false;
    this.clearTimers();
    this.listeners.clear();
  }

  private emit(next: ShabbatState): void {
    this.state = next;
    for (const listener of this.listeners) listener(next);
  }

  private clearTimers(): void {
    for (const timer of this.timers) clearTimeout(timer);
    this.timers = [];
  }

  private schedule(at: Date, fn: () => void): void {
    const ms = Math.max(5000, Math.min(at.getTime() - Date.now(), 60 * 60 * 1000));
    const timer = setTimeout(fn, ms);
    this.timers.push(timer);
  }

  private async run(): Promise<void> {
    if (!this.active) return;
    this.clearTimers();

    try {
      const location = await this.resolveLocation();
      if (!location) {
        this.emit({ status: "inactive", location: null, times: null });
        return;
      }

      const times = await this.resolveTimes(location);
      const status = this.resolveStatus(times);
      this.emit({ status, location, times });
      this.scheduleBoundaries(times);
    } catch {
      const fallback = this.config.defaultLocation;
      try {
        const times = await this.fetchTimes(fallback);
        const status = this.resolveStatus(times);
        this.emit({ status, location: fallback, times });
        this.scheduleBoundaries(times);
      } catch {
        this.emit({ status: "inactive", location: null, times: null });
      }
    }
  }

  private scheduleBoundaries(times: ShabbatTimes): void {
    const now = Date.now();
    const warningAt = times.candleLighting.getTime() - this.config.warningMinutes * 60_000;

    if (now < warningAt) {
      this.schedule(new Date(warningAt), () => void this.run());
    } else if (now < times.candleLighting.getTime()) {
      this.schedule(times.candleLighting, () => void this.run());
    } else if (now < times.havdalah.getTime()) {
      this.schedule(times.havdalah, () => void this.run());
    } else {
      this.schedule(new Date(now + 60 * 60 * 1000), () => void this.run());
    }
  }

  private resolveStatus(times: ShabbatTimes): ShabbatState["status"] {
    const now = Date.now();
    const warningAt = times.candleLighting.getTime() - this.config.warningMinutes * 60_000;
    if (now >= times.candleLighting.getTime() && now < times.havdalah.getTime()) return "active";
    if (now >= warningAt && now < times.candleLighting.getTime()) return "approaching";
    return "inactive";
  }

  private async resolveTimes(location: ShabbatLocation): Promise<ShabbatTimes> {
    const cacheKey = this.buildCacheKey(location);
    const cached = this.readCache(cacheKey);
    const now = Date.now();

    if (cached && now - cached.ts < 24 * 60 * 60 * 1000) {
      return {
        candleLighting: new Date(cached.in),
        havdalah: new Date(cached.out),
      };
    }

    const times = await this.fetchTimes(location);
    this.writeCache(cacheKey, {
      ts: now,
      in: times.candleLighting.getTime(),
      out: times.havdalah.getTime(),
    });
    return times;
  }

  private buildCacheKey(location: ShabbatLocation): string {
    return `${this.config.cacheKey}:${location.timezone}:${Math.round(location.latitude * 100)}:${Math.round(location.longitude * 100)}`;
  }

  private readCache(key: string): CachedTimes | null {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as CachedTimes) : null;
    } catch {
      return null;
    }
  }

  private writeCache(key: string, value: CachedTimes): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }

  private resolveHavdalahMinutes(): number {
    if (this.config.minhag === "custom") return this.config.havdalahMinutes;
    const map = { default: 40, chabad: 50, jerusalem40: 40 } as const;
    return map[this.config.minhag] ?? 40;
  }

  private async fetchTimes(location: ShabbatLocation): Promise<ShabbatTimes> {
    const b = this.resolveHavdalahMinutes();
    const url =
      `https://www.hebcal.com/shabbat?cfg=json&latitude=${location.latitude}` +
      `&longitude=${location.longitude}&tzid=${encodeURIComponent(location.timezone)}&b=${b}&M=on`;

    const response = await this.fetchWithTimeout(url, 9000);
    if (!response.ok) throw new Error("hebcal_failed");

    const data = (await response.json()) as {
      items?: Array<{ category: string; date: string }>;
    };
    const items = data.items ?? [];
    const candles = items.find((item) => item.category === "candles");
    const havdalah = items.find((item) => item.category === "havdalah");
    if (!candles || !havdalah) throw new Error("times_not_found");

    return {
      candleLighting: new Date(candles.date),
      havdalah: new Date(havdalah.date),
    };
  }

  private async resolveLocation(): Promise<ShabbatLocation | null> {
    const mode = this.config.location;

    if (mode === "none") return this.config.defaultLocation;

    if (mode === "api") {
      try {
        return await this.locateByIp();
      } catch {
        return this.config.defaultLocation;
      }
    }

    if (mode === "prompt-only") {
      try {
        return await this.locateByGeolocation();
      } catch {
        return this.config.onDeny === "api" ? this.locateByIp().catch(() => this.config.defaultLocation) : null;
      }
    }

    try {
      return await this.locateByGeolocation();
    } catch {
      try {
        return await this.locateByIp();
      } catch {
        return this.config.defaultLocation;
      }
    }
  }

  private locateByGeolocation(): Promise<ShabbatLocation> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("geolocation_unavailable"));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
            source: "geolocation",
          }),
        () => reject(new Error("geolocation_denied")),
        { enableHighAccuracy: false, timeout: 6000, maximumAge: 5 * 60 * 1000 }
      );
    });
  }

  private async locateByIp(): Promise<ShabbatLocation> {
    const response = await this.fetchWithTimeout("https://ipapi.co/json/", 7000);
    if (!response.ok) throw new Error("ipapi_failed");
    const data = (await response.json()) as {
      latitude: number;
      longitude: number;
      timezone: string;
    };
    return {
      latitude: data.latitude,
      longitude: data.longitude,
      timezone: data.timezone,
      source: "ipapi",
    };
  }

  private fetchWithTimeout(url: string, ms: number): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ms);
    return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timer));
  }
}
