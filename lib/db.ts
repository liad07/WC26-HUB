import "server-only";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

let cached: NeonQueryFunction<false, false> | null = null;

/** Lazily creates the Neon SQL client so a missing DATABASE_URL never breaks build. */
export function getSql(): NeonQueryFunction<false, false> {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured");
  if (!cached) cached = neon(process.env.DATABASE_URL);
  return cached;
}

export const hasDatabase = (): boolean => !!process.env.DATABASE_URL;
