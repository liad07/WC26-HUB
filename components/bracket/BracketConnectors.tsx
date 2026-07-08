import {
  BRACKET_CARD_HEIGHT,
  type BracketRoundView,
} from "@/lib/bracketTree";

/** SVG connectors between adjacent knockout rounds in the bracket tree. */
export function BracketConnectors({
  left,
  right,
  height,
}: {
  left: BracketRoundView;
  right: BracketRoundView;
  height: number;
}) {
  const width = 32;
  const pairs = right.slots.length;

  return (
    <svg
      aria-hidden
      width={width}
      height={height}
      className="shrink-0 self-start text-pitch-border"
      viewBox={`0 0 ${width} ${height}`}
    >
      {Array.from({ length: pairs }, (_, i) => {
        const child = right.slots[i];
        if (!child) return null;
        const topA = left.slots[i * 2]?.topPx ?? 0;
        const topB = left.slots[i * 2 + 1]?.topPx ?? 0;
        const yA = topA + BRACKET_CARD_HEIGHT / 2;
        const yB = topB + BRACKET_CARD_HEIGHT / 2;
        const yC = child.topPx + BRACKET_CARD_HEIGHT / 2;
        const midX = width / 2;
        return (
          <g key={child.match.id} stroke="currentColor" strokeWidth="1.5" fill="none" opacity={0.55}>
            <path d={`M${width} ${yA} H${midX} V${yC} H0`} />
            <path d={`M${width} ${yB} H${midX} V${yC}`} />
          </g>
        );
      })}
    </svg>
  );
}
