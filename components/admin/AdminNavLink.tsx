"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Icon } from "@/components/Icon";
import { CHAT_AUTH_ENABLED } from "@/lib/features";

const ADMIN_EMAIL = "liad07@gmail.com";

/** Admin nav link — visible only to the site owner. */
export function AdminNavLink({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname();
  const { user, isLoaded } = useUser();

  if (!CHAT_AUTH_ENABLED || !isLoaded) return null;
  const email = user?.primaryEmailAddress?.emailAddress;
  if (!email || email.toLowerCase() !== ADMIN_EMAIL) return null;

  const active = pathname.startsWith("/admin");

  if (compact) {
    return (
      <Link
        href="/admin"
        className={`nav-link ${active ? "nav-link-active" : ""}`}
        aria-current={active ? "page" : undefined}
      >
        <Icon name="info" size={19} />
        אדמין
      </Link>
    );
  }

  return (
    <Link
      href="/admin"
      className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition ${
        active
          ? "border-pitch-brand bg-brand-gradient text-white shadow-glow"
          : "border-white/10 bg-white/5 text-gray-300 hover:border-pitch-brand hover:text-white"
      }`}
    >
      <Icon name="info" size={15} className={active ? "text-white" : "text-pitch-accent"} />
      לוח בקרה
    </Link>
  );
}
