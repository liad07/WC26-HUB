import Link from "next/link";
import { WatchExperience } from "@/components/watch/WatchExperience";

export const metadata = { title: "שידור חי · World Cup Hub" };

const STREAM_URL =
  "https://dkxdt1pg247x2.cloudfront.net/livehls/oil/kancdn-live/live/kan11/live.livx/playlist.m3u8";

export default function WatchPage() {
  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow mb-1">שידור ישיר</p>
          <h1 className="text-2xl font-black text-white sm:text-3xl">
            שידור חי · <span className="brand-text">מונדיאל 2026</span>
          </h1>
          <p className="mt-1 text-sm text-gray-400">צפייה ישירה, לוח שידורי המונדיאל והמשחק שמשודר עכשיו</p>
        </div>
        <Link href="/schedule" className="btn-ghost">
          חזרה ללוח המשחקים
        </Link>
      </header>

      <WatchExperience streamUrl={STREAM_URL} />

      <p className="text-center text-xs text-gray-600">
        אם השידור אינו נטען, ייתכן שהוא אינו זמין באזורך או שהסתיים.
      </p>
    </div>
  );
}
