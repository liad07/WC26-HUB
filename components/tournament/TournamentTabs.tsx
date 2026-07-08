"use client";

import { useState } from "react";
import type { StandingGroup } from "@/types/match";
import { StandingsGroups } from "@/components/StandingsGroups";
import { BracketBoard } from "@/components/bracket/BracketBoard";

export type TournamentTab = "groups" | "knockout";

const TABS: { id: TournamentTab; label: string }[] = [
  { id: "groups", label: "בתים וטבלאות" },
  { id: "knockout", label: "נוקאאוט" },
];

const HERO: Record<TournamentTab, { title: string; subtitle: string }> = {
  groups: { title: "שלב הבתים", subtitle: "דירוג כל 12 הבתים — מי מעפיל לשלב הנוקאאוט" },
  knockout: { title: "הדרך לגמר", subtitle: "כל שלב הנוקאאוט במבט אחד — מי עולה, מי מודח ומי ירים את הגביע" },
};

/** Unified tournament view: one hero + pill switcher toggling group tables and the knockout bracket. */
export function TournamentTabs({
  groups,
  failed,
  initialTab,
}: {
  groups: StandingGroup[];
  failed: boolean;
  initialTab: TournamentTab;
}) {
  const [tab, setTab] = useState<TournamentTab>(initialTab);
  const hero = HERO[tab];

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 p-6 text-center shadow-card sm:p-10">
        <div className="absolute inset-0 bg-[url('/images/hero-trophy.png')] bg-cover bg-center opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-pitch-bg via-pitch-bg/85 to-pitch-bg/55" />
        <div className="relative">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.35em] text-pitch-gold">World Cup 2026</p>
          <h1 className="animated-gradient animate-gradient-x bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-3xl font-black text-transparent sm:text-5xl">
            {hero.title}
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-gray-300">{hero.subtitle}</p>
        </div>
      </section>

      <TabSwitcher tab={tab} onChange={setTab} />

      {tab === "groups" ? <StandingsGroups groups={groups} failed={failed} /> : <BracketBoard />}
    </div>
  );
}

/** Premium RTL segmented control with a sliding active pill. */
function TabSwitcher({ tab, onChange }: { tab: TournamentTab; onChange: (t: TournamentTab) => void }) {
  const activeIndex = TABS.findIndex((t) => t.id === tab);
  return (
    <div
      role="tablist"
      className="glass relative mx-auto grid w-full max-w-sm grid-cols-2 gap-1 rounded-full border border-white/10 p-1"
    >
      <span
        aria-hidden
        className="absolute inset-y-1 w-[calc(50%-0.25rem)] rounded-full bg-gradient-to-l from-pitch-accent to-pitch-accent/70 shadow-card transition-transform duration-300 ease-out"
        style={{ right: "0.25rem", transform: `translateX(${activeIndex * -100}%)` }}
      />
      {TABS.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={tab === t.id}
          onClick={() => onChange(t.id)}
          className={`relative z-10 rounded-full px-4 py-2 text-sm font-black transition-colors ${
            tab === t.id ? "text-pitch-bg" : "text-gray-300 hover:text-white"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
