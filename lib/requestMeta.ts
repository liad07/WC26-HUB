import "server-only";

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

export function getUserAgent(req: Request): string {
  return req.headers.get("user-agent")?.slice(0, 512) || "unknown";
}

export function getReferrer(req: Request): string | null {
  return req.headers.get("referer")?.slice(0, 512) ?? null;
}
