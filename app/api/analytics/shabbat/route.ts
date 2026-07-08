import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { analyticsRepo, type ShabbatEventType } from "@/lib/analyticsRepo";
import { hasDatabase } from "@/lib/db";
import { getClientIp, getUserAgent } from "@/lib/requestMeta";

export const dynamic = "force-dynamic";

const ALLOWED: ShabbatEventType[] = [
  "blocked_stream",
  "blocked_chat",
  "banner_shown",
  "overlay_shown",
  "page_view_during_shabbat",
];

/** Records Shabbat guard interactions for admin effectiveness metrics. */
export async function POST(req: Request) {
  if (!hasDatabase()) return NextResponse.json({ ok: true, offline: true });

  const body = await req.json().catch(() => null);
  const eventType = body?.eventType as ShabbatEventType;
  const sessionId = typeof body?.sessionId === "string" ? body.sessionId : null;
  const path = typeof body?.path === "string" ? body.path : null;

  if (!eventType || !ALLOWED.includes(eventType)) {
    return NextResponse.json({ error: "invalid_event" }, { status: 400 });
  }

  const { userId } = await auth();

  try {
    await analyticsRepo.recordShabbatEvent({
      eventType,
      sessionId,
      userId,
      ip: getClientIp(req),
      userAgent: getUserAgent(req),
      path,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "record_failed" }, { status: 502 });
  }
}
