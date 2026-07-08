"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getShabbatConfig } from "@/lib/shabbat/config";
import { ShabbatService } from "@/lib/shabbat/ShabbatService";
import type { ShabbatState } from "@/lib/shabbat/types";

interface ShabbatContextValue extends ShabbatState {
  enabled: boolean;
  isShabbat: boolean;
  isApproaching: boolean;
}

const ShabbatContext = createContext<ShabbatContextValue | null>(null);

const IDLE: ShabbatState = { status: "inactive", location: null, times: null };

/** Provides Shabbat detection state to the client tree. */
export function ShabbatProvider({ children }: { children: ReactNode }) {
  const config = useMemo(() => getShabbatConfig(), []);
  const [state, setState] = useState<ShabbatState>(config.enabled ? { ...IDLE, status: "loading" } : IDLE);

  useEffect(() => {
    if (!config.enabled) return;
    const service = new ShabbatService(config);
    const unsubscribe = service.subscribe(setState);
    service.start();
    return () => {
      unsubscribe();
      service.destroy();
    };
  }, [config]);

  const value = useMemo<ShabbatContextValue>(
    () => ({
      ...state,
      enabled: config.enabled,
      isShabbat: state.status === "active",
      isApproaching: state.status === "approaching",
    }),
    [config.enabled, state]
  );

  return <ShabbatContext.Provider value={value}>{children}</ShabbatContext.Provider>;
}

export function useShabbat(): ShabbatContextValue {
  const ctx = useContext(ShabbatContext);
  if (!ctx) {
    return { ...IDLE, enabled: false, isShabbat: false, isApproaching: false };
  }
  return ctx;
}
