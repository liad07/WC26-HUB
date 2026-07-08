import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { isAdminEmail } from "@/lib/admin";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { CHAT_AUTH_ENABLED } from "@/lib/features";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin · World Cup Hub",
  robots: { index: false, follow: false },
};

/** Server-gated admin analytics — liad07@gmail.com only. */
export default async function AdminPage() {
  if (!CHAT_AUTH_ENABLED) redirect("/");

  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress;

  if (!user || !isAdminEmail(email)) redirect("/");

  return (
    <div className="space-y-2">
      <AdminDashboard />
    </div>
  );
}
