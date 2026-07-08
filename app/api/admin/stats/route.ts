import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { analyticsRepo } from "@/lib/analyticsRepo";
import { hasDatabase } from "@/lib/db";
import { requireAdmin } from "@/lib/requireAdmin";
import { CHAT_AUTH_ENABLED } from "@/lib/features";

export const dynamic = "force-dynamic";

/** Admin-only aggregated analytics — raw IPs never leave this route. */
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  if (!hasDatabase()) {
    return NextResponse.json({ error: "database_not_configured" }, { status: 503 });
  }

  try {
    const stats = await analyticsRepo.getDashboardStats();
    const usersSeenDb = await analyticsRepo.countUsersSeen();

    let clerkTotal = 0;
    let clerkNewWeek = 0;
    let recentSignups: Array<{ id: string; email: string | null; name: string | null; createdAt: number }> = [];

    if (CHAT_AUTH_ENABLED) {
      const client = await clerkClient();
      const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const list = await client.users.getUserList({ limit: 100, orderBy: "-created_at" });
      clerkTotal = list.totalCount;
      recentSignups = list.data.map((u) => ({
        id: u.id,
        email: u.primaryEmailAddress?.emailAddress ?? null,
        name: u.fullName || u.username || u.firstName || null,
        createdAt: u.createdAt,
      }));
      clerkNewWeek = list.data.filter((u) => u.createdAt >= weekAgo).length;
    }

    return NextResponse.json({
      stats,
      users: {
        clerkTotal,
        clerkNewWeek,
        usersSeenDb,
        recentSignups: recentSignups.slice(0, 8),
      },
      adminEmail: admin.primaryEmailAddress?.emailAddress,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "stats_failed", message: (error as Error).message },
      { status: 502 }
    );
  }
}
