export interface ParsedUserAgent {
  device: "mobile" | "desktop" | "tablet" | "unknown";
  browser: string;
}

export function parseUserAgent(ua: string): ParsedUserAgent {
  const lower = ua.toLowerCase();
  const device = /ipad|tablet/.test(lower)
    ? "tablet"
    : /mobile|android|iphone|ipod/.test(lower)
      ? "mobile"
      : ua === "unknown"
        ? "unknown"
        : "desktop";

  let browser = "אחר";
  if (lower.includes("edg/")) browser = "Edge";
  else if (lower.includes("chrome/") && !lower.includes("edg/")) browser = "Chrome";
  else if (lower.includes("firefox/")) browser = "Firefox";
  else if (lower.includes("safari/") && !lower.includes("chrome/")) browser = "Safari";
  else if (lower.includes("opera") || lower.includes("opr/")) browser = "Opera";

  return { device, browser };
}

export function truncateUserAgent(ua: string, max = 48): string {
  if (ua.length <= max) return ua;
  return `${ua.slice(0, max)}…`;
}
