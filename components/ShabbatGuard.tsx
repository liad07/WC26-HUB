"use client";

import { ShabbatProvider } from "@/components/shabbat/ShabbatProvider";
import { ShabbatOverlay } from "@/components/shabbat/ShabbatOverlay";
import { ShabbatBanner } from "@/components/shabbat/ShabbatBanner";
import type { ReactNode } from "react";

/** Site-wide Shabbat guard: detection context, pre-Shabbat banner and closure overlay. */
export function ShabbatGuard({ children }: { children: ReactNode }) {
  return (
    <ShabbatProvider>
      <ShabbatBanner />
      <ShabbatOverlay />
      {children}
    </ShabbatProvider>
  );
}
