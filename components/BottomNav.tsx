"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/Icon";
import { MOBILE_NAV_ITEMS } from "@/lib/nav";

/** Floating glass bottom navigation for mobile with active-route highlight. */
export function BottomNav() {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <nav className="fixed inset-x-3 bottom-3 z-40 lg:hidden">
      <ul className="glass flex items-center justify-between rounded-2xl px-2 py-1.5 shadow-card">
        {MOBILE_NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={`flex flex-col items-center gap-1 rounded-xl py-2 text-[11px] font-bold transition ${
                  active ? "bg-brand-gradient text-white shadow-glow" : "text-gray-400"
                }`}
              >
                <Icon name={item.icon} size={20} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
