import { NextResponse } from "next/server";
import { analyticsRepo } from "@/lib/analyticsRepo";
import { hasDatabase } from "@/lib/db";
import { requireAdmin } from "@/lib/requireAdmin";

export const dynamic = "force-dynamic";

/** Admin-only live /watch presence with IP and user-agent details. */
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  if (!hasDatabase()) {
    return NextResponse.json({ error: "database_not_configured" }, { status: 503 });
  }

  try {
    const viewers = await analyticsRepo.listLiveViewers();
    return NextResponse.json({ viewers, count: viewers.length });
  } catch (error) {
    return NextResponse.json(
      { error: "live_failed", message: (error as Error).message },
      { status: 502 }
    );
  }
}
