"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useShabbat } from "@/components/shabbat/ShabbatProvider";

const SESSION_KEY = "wc26_sid";

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

/** Lightweight client beacon — sends path heartbeats without exposing PII. */
export function AnalyticsBeacon() {
  const pathname = usePathname();
  const { isShabbat } = useShabbat();
  useEffect(() => {
    const isWatch = pathname.startsWith("/watch");
    const intervalMs = isWatch ? 15_000 : 30_000;

    const ping = () => {
      const sessionId = getSessionId();
      void fetch("/api/analytics/ping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: pathname,
          sessionId,
          isWatch,
          isShabbat,
        }),
        keepalive: true,
      });
    };

    ping();
    const id = setInterval(ping, intervalMs);
    return () => clearInterval(id);
  }, [pathname, isShabbat]);

  return null;
}
