import Link from "next/link";
import { Icon } from "@/components/Icon";

/** Centered premium mobile footer with the Crack Apps → StreamNet → World Cup Hub lineage. */
export function Footer() {
  return (
    <footer className="px-4 pt-12 pb-28 lg:hidden">
      <div className="mx-auto max-w-sm">
        <div className="mx-auto mb-10 h-px w-40 bg-gradient-to-l from-transparent via-white/20 to-transparent" />

        <div className="glass card-hover relative overflow-hidden rounded-3xl px-6 py-8 text-center shadow-card">
          <div className="pointer-events-none absolute inset-x-0 -top-16 h-32 bg-brand-radial" />

          <div className="relative flex flex-col items-center gap-4">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-gradient shadow-glow">
              <Icon name="play" size={22} className="text-white" />
            </span>

            <div>
              <p className="text-lg font-black tracking-tight text-white">
                World Cup <span className="brand-text">Hub</span>
              </p>
              <p className="eyebrow mt-1.5">Powered by{" "}
                <a href="https://github.com/liad07/StreamNet" target="_blank" rel="noopener noreferrer" className="transition hover:text-pitch-accent">StreamNet</a>
              </p>
            </div>

            <p className="max-w-[15rem] text-xs leading-relaxed text-gray-500">
              נבנה באהבה <span className="text-pitch-live">❤️</span> ע״י{" "}
              <a href="https://github.com/liad07/crack-apps.github.io" target="_blank" rel="noopener noreferrer" className="font-bold text-gray-300 transition hover:text-pitch-accent">Crack Apps</a> · מבוסס על{" "}
              <a href="https://github.com/liad07/StreamNet" target="_blank" rel="noopener noreferrer" className="font-bold text-gray-300 transition hover:text-pitch-accent">StreamNet</a>
            </p>

            <Link href="/about" className="btn-ghost mt-1 w-full py-2.5 text-xs">
              <Icon name="info" size={15} className="text-pitch-accent" />
              אודות
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-[11px] font-semibold tracking-wide text-gray-600">
          © {new Date().getFullYear()} Crack Apps
        </p>
      </div>
    </footer>
  );
}
