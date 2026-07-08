import { Brand } from "@/components/Brand";
import { Icon } from "@/components/Icon";
import { CHAT_AUTH_ENABLED } from "@/lib/features";
import { TopbarAuth } from "@/components/TopbarAuth";
import { AdminNavLink } from "@/components/admin/AdminNavLink";

/** Sticky top bar: mobile brand, search field and account/notification actions. */
export function Topbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-pitch-bg/70 backdrop-blur-xl">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="lg:hidden">
          <Brand compact />
        </div>

        <label className="relative hidden flex-1 items-center sm:flex">
          <span className="pointer-events-none absolute right-3 text-gray-500">
            <Icon name="search" size={18} />
          </span>
          <input
            type="search"
            placeholder="חיפוש נבחרת, משחק או שחקן..."
            className="w-full max-w-md rounded-xl border border-white/10 bg-white/5 py-2.5 pr-10 pl-4 text-sm text-gray-200 placeholder:text-gray-500 focus:border-pitch-brand/50 focus:outline-none focus:ring-2 focus:ring-pitch-brand/25"
          />
        </label>

        <div className="mr-auto flex items-center gap-2">
          <AdminNavLink />
          <button
            aria-label="חיפוש"
            className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-gray-300 transition hover:text-white sm:hidden"
          >
            <Icon name="search" size={18} />
          </button>
          <button
            aria-label="התראות"
            className="relative grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-gray-300 transition hover:text-white"
          >
            <Icon name="bell" size={18} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-pitch-live ring-2 ring-pitch-bg" />
          </button>
          {CHAT_AUTH_ENABLED ? <TopbarAuth /> : <GuestChip />}
        </div>
      </div>
    </header>
  );
}

/** Static guest badge shown when auth is not configured. */
function GuestChip() {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 py-1.5 pr-2 pl-3">
      <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-gradient text-white">
        <Icon name="user" size={15} />
      </span>
      <span className="hidden text-sm font-bold text-gray-200 sm:block">אורח</span>
    </div>
  );
}
