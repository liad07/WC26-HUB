import type { IconName } from "@/components/Icon";

export interface NavItem {
  href: string;
  label: string;
  icon: IconName;
}

/** Single source of truth for primary navigation across all nav shells. */
export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "בית", icon: "home" },
  { href: "/schedule", label: "שידורים", icon: "calendar" },
  { href: "/live", label: "לייב", icon: "live" },
  { href: "/tournament", label: "טורניר", icon: "trophy" },
  { href: "/watch", label: "שידור חי", icon: "tv" },
  { href: "/chat", label: "צ׳אט", icon: "chat" },
];

/** Compact subset used by the mobile bottom bar. */
export const MOBILE_NAV_ITEMS: NavItem[] = [
  NAV_ITEMS[0],
  NAV_ITEMS[1],
  NAV_ITEMS[2],
  NAV_ITEMS[3],
  NAV_ITEMS[5],
];
