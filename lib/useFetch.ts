"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

/** Client hook for JSON GET with optional polling interval (ms). Skips when url is empty. */
export function useFetch<T>(url: string, pollMs?: number): FetchState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const firstLoad = useRef(true);

  const load = useCallback(async () => {
    if (!url) {
      setLoading(false);
      return;
    }
    try {
      if (firstLoad.current) setLoading(true);
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData((await res.json()) as T);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
      firstLoad.current = false;
    }
  }, [url]);

  useEffect(() => {
    load();
    if (!pollMs || !url) return;
    const id = setInterval(load, pollMs);
    return () => clearInterval(id);
  }, [load, pollMs, url]);

  return { data, loading, error, reload: load };
}
