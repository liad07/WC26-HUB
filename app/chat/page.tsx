import { FanChat } from "@/components/FanChat";
import { PageHeader } from "@/components/common";

export const metadata = { title: "צ׳אט אוהדים · מונדיאל עכשיו" };

export default function ChatPage() {
  return (
    <div className="space-y-5">
      <PageHeader eyebrow="קהילה" title="צ׳אט אוהדים" subtitle="הצ׳אט הכללי של המונדיאל" />
      <FanChat roomId="general" title="צ׳אט כללי" />
    </div>
  );
}
