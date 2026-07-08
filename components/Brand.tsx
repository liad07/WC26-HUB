import Link from "next/link";
import { Icon } from "@/components/Icon";

/** App wordmark: gradient play-badge + product name and StreamNet lineage caption. */
export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="group flex items-center gap-2.5">
      <span className="relative grid h-10 w-10 place-items-center rounded-xl bg-brand-gradient shadow-glow transition group-hover:brightness-110">
        <Icon name="play" size={18} className="text-white" />
      </span>
      {!compact && (
        <span className="leading-tight">
          <span className="block text-base font-black tracking-tight text-white">
            World Cup <span className="brand-text">Hub</span>
          </span>
          <span className="block text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500">
            Powered by StreamNet
          </span>
        </span>
      )}
    </Link>
  );
}
