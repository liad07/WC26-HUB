import { ScheduleList } from "@/components/ScheduleList";
import { PageHeader } from "@/components/common";

export const metadata = { title: "לוח שידורים · מונדיאל עכשיו" };

export default function SchedulePage() {
  return (
    <div className="space-y-5">
      <PageHeader eyebrow="World Cup 2026" title="לוח שידורים" subtitle="כל המשחקים בשעון ישראל" />
      <ScheduleList />
    </div>
  );
}
