"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useShabbat } from "@/components/shabbat/ShabbatProvider";

const SESSION_KEY = "wc26_sid";

function sessionId(): string {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

function postShabbat(eventType: string, path: string) {
  void fetch("/api/analytics/shabbat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eventType, sessionId: sessionId(), path }),
  });
}

/** Fires Shabbat guard analytics once per state transition. */
export function ShabbatAnalytics() {
  const { isShabbat, isApproaching } = useShabbat();
  const pathname = usePathname();
  const seen = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!isApproaching) return;
    const key = "banner";
    if (seen.current.has(key)) return;
    seen.current.add(key);
    postShabbat("banner_shown", pathname);
  }, [isApproaching, pathname]);

  useEffect(() => {
    if (!isShabbat) return;
    const overlayKey = "overlay";
    if (!seen.current.has(overlayKey)) {
      seen.current.add(overlayKey);
      postShabbat("overlay_shown", pathname);
    }
    if (pathname.startsWith("/watch")) {
      const key = "stream";
      if (seen.current.has(key)) return;
      seen.current.add(key);
      postShabbat("blocked_stream", pathname);
    }
  }, [isShabbat, pathname]);

  return null;
}
