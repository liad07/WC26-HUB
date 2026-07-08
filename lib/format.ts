import type { MatchStatus } from "@/types/match";
import type { EventItem } from "@/types/match";

const STATUS_HE: Record<MatchStatus, string> = {
  NOT_STARTED: "טרם החל",
  LIVE: "משחק חי",
  HALF_TIME: "מחצית",
  FINISHED: "הסתיים",
  POSTPONED: "נדחה",
  UNKNOWN: "לא ידוע",
};

/** Maps an API-Football short status code to an internal status. */
export function mapStatus(short: string): MatchStatus {
  const live = ["1H", "2H", "ET", "BT", "P", "LIVE"];
  if (short === "HT") return "HALF_TIME";
  if (live.includes(short)) return "LIVE";
  if (["FT", "AET", "PEN"].includes(short)) return "FINISHED";
  if (["NS", "TBD"].includes(short)) return "NOT_STARTED";
  if (["PST", "CANC", "ABD", "SUSP", "AWD", "WO"].includes(short)) return "POSTPONED";
  return "UNKNOWN";
}

export function statusLabel(status: MatchStatus): string {
  return STATUS_HE[status];
}

export function isLiveStatus(status: MatchStatus): boolean {
  return status === "LIVE" || status === "HALF_TIME";
}

/** Maps an API-Football event type/detail to an internal event kind. */
export function mapEventType(type: string, detail: string): EventItem["type"] {
  const t = type.toLowerCase();
  const d = detail.toLowerCase();
  if (t === "goal") return "GOAL";
  if (t === "card" && d.includes("yellow")) return "YELLOW";
  if (t === "card" && d.includes("red")) return "RED";
  if (t === "subst") return "SUBST";
  if (t === "var") return "VAR";
  return "OTHER";
}

const EVENT_META: Record<EventItem["type"], { icon: string; label: string }> = {
  GOAL: { icon: "⚽", label: "שער" },
  YELLOW: { icon: "🟨", label: "כרטיס צהוב" },
  RED: { icon: "🟥", label: "כרטיס אדום" },
  SUBST: { icon: "🔁", label: "חילוף" },
  VAR: { icon: "📺", label: "VAR" },
  OTHER: { icon: "•", label: "אירוע" },
};

export function eventMeta(type: EventItem["type"]) {
  return EVENT_META[type];
}

export function formatMinute(minute: number, extra: number | null): string {
  return extra ? `${minute}+${extra}'` : `${minute}'`;
}
