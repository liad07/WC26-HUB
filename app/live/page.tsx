import { LiveScores } from "@/components/LiveScores";
import { PageHeader } from "@/components/common";

export const metadata = { title: "תוצאות לייב · מונדיאל עכשיו" };

export default function LivePage() {
  return (
    <div className="space-y-5">
      <PageHeader eyebrow="בזמן אמת" title="תוצאות לייב" subtitle="תוצאות, גולים ואירועים חיים" live />
      <LiveScores />
    </div>
  );
}
