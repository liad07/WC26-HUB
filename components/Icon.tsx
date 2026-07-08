import type { SVGProps } from "react";

export type IconName =
  | "home"
  | "calendar"
  | "live"
  | "bracket"
  | "trophy"
  | "tv"
  | "chat"
  | "search"
  | "bell"
  | "settings"
  | "menu"
  | "user"
  | "play"
  | "close"
  | "bolt"
  | "info";

const PATHS: Record<IconName, string> = {
  home: "M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5",
  calendar: "M7 3v3M17 3v3M4 9h16M5 6h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z",
  live: "M12 12h.01M8.5 8.5a5 5 0 0 0 0 7M15.5 8.5a5 5 0 0 1 0 7M5.5 5.5a9 9 0 0 0 0 13M18.5 5.5a9 9 0 0 1 0 13",
  bracket: "M6 4h5v6H6zM6 14h5v6H6zM11 7h4v10h-4M15 12h3",
  trophy: "M8 4h8v4a4 4 0 0 1-8 0V4ZM8 6H5v1a3 3 0 0 0 3 3M16 6h3v1a3 3 0 0 1-3 3M10 13.5V17M14 13.5V17M8 20h8M9 17h6",
  tv: "M4 7h16v11H4zM8 3l4 4 4-4",
  chat: "M4 5h16v11H9l-5 4V5Z",
  search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM20 20l-4-4",
  bell: "M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6M10 21a2 2 0 0 0 4 0",
  settings:
    "M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM19 12a7 7 0 0 0-.1-1l2-1.6-2-3.4-2.4 1a7 7 0 0 0-1.7-1L14.5 3h-5l-.3 2.6a7 7 0 0 0-1.7 1l-2.4-1-2 3.4 2 1.6a7 7 0 0 0 0 2l-2 1.6 2 3.4 2.4-1a7 7 0 0 0 1.7 1l.3 2.4h5l.3-2.4a7 7 0 0 0 1.7-1l2.4 1 2-3.4-2-1.6a7 7 0 0 0 .1-1Z",
  menu: "M4 6h16M4 12h16M4 18h16",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21a8 8 0 0 1 16 0",
  play: "M8 5v14l11-7z",
  close: "M6 6l12 12M18 6 6 18",
  bolt: "M13 2 4 14h7l-1 8 9-12h-7l1-8Z",
  info: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM12 11v5M12 7.5h.01",
};

const FILLED: Partial<Record<IconName, boolean>> = { play: true };

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number;
}

/** Lightweight inline-SVG icon set shared by the nav shells. */
export function Icon({ name, size = 20, ...props }: IconProps) {
  const filled = FILLED[name];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke={filled ? "none" : "currentColor"}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
