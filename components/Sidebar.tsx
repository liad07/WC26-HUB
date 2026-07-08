"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brand } from "@/components/Brand";
import { Icon } from "@/components/Icon";
import { NAV_ITEMS } from "@/lib/nav";
import { ShabbatIndicator } from "@/components/shabbat/ShabbatIndicator";

/** Persistent desktop sidebar (RTL, right-aligned) with brand, live CTA and nav. */
export function Sidebar() {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <aside className="fixed inset-y-0 right-0 z-40 hidden w-64 flex-col gap-6 border-l border-white/5 bg-pitch-bg2/80 px-4 py-6 backdrop-blur-xl lg:flex">
      <Brand />

      <Link
        href="/watch"
        className="group flex items-center gap-3 rounded-xl bg-pitch-live/10 px-3.5 py-3 text-sm font-black text-pitch-live ring-1 ring-pitch-live/30 transition hover:bg-pitch-live/15 hover:shadow-glow-live"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pitch-live opacity-60" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-pitch-live" />
        </span>
        עכשיו בשידור
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-link ${isActive(item.href) ? "nav-link-active" : ""}`}
          >
            <Icon name={item.icon} size={19} />
            {item.label}
          </Link>
        ))}
      </nav>

      <ShabbatIndicator />

      <LineageCard active={isActive("/about")} />
    </aside>
  );
}

/** Bottom-pinned lineage panel: Crack Apps → StreamNet → World Cup Hub, with an About link. */
function LineageCard({ active }: { active: boolean }) {
  return (
    <div className="glass relative overflow-hidden rounded-2xl p-4 shadow-card">
      <div className="pointer-events-none absolute inset-x-0 -top-12 h-24 bg-brand-radial" />
      <div className="relative space-y-3">
        <div>
          <p className="text-sm font-black tracking-tight text-white">
            World Cup <span className="brand-text">Hub</span>
          </p>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
            Powered by{" "}
            <a href="https://github.com/liad07/StreamNet" target="_blank" rel="noopener noreferrer" className="transition hover:text-pitch-accent">StreamNet</a>
          </p>
        </div>

        <p className="text-[11px] leading-relaxed text-gray-500">
          נבנה באהבה <span className="text-pitch-live">❤</span> ע״י{" "}
          <a href="https://github.com/liad07/crack-apps.github.io" target="_blank" rel="noopener noreferrer" className="font-bold text-gray-300 transition hover:text-pitch-accent">Crack Apps</a>
        </p>

        <Link
          href="/about"
          className={`flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold transition hover:border-pitch-brand hover:bg-white/10 hover:text-white ${
            active ? "text-white" : "text-gray-300"
          }`}
        >
          <Icon name="info" size={15} className="text-pitch-accent" />
          אודות
        </Link>
      </div>
    </div>
  );
}
