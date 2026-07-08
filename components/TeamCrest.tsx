"use client";

import { useMemo, useState } from "react";
import type { TeamInfo } from "@/types/match";
import { flagUrl, teamImageSrc } from "@/lib/flags";

function isValidImageUrl(url: string | null | undefined): url is string {
  return Boolean(url && /^https?:\/\//i.test(url));
}

export function TeamCrest({ team, size = 40 }: { team: TeamInfo; size?: number }) {
  const width = size <= 40 ? 40 : size <= 80 ? 80 : 160;
  const sources = useMemo(() => {
    const chain: string[] = [];
    if (isValidImageUrl(team.logo)) chain.push(team.logo);
    const flag = flagUrl(team.name, width);
    if (flag) chain.push(flag);
    chain.push(teamImageSrc({ name: team.name, logo: "" }, width));
    return chain;
  }, [team.logo, team.name, width]);

  const [index, setIndex] = useState(0);
  const src = sources[Math.min(index, sources.length - 1)];

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={team.name}
      width={size}
      height={size}
      loading="lazy"
      className="rounded-sm object-contain"
      style={{ width: size, height: size }}
      onError={() => setIndex((current) => (current < sources.length - 1 ? current + 1 : current))}
    />
  );
}
