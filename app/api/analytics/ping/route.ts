import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { analyticsRepo } from "@/lib/analyticsRepo";
import { hasDatabase } from "@/lib/db";
import { getClientIp, getReferrer, getUserAgent } from "@/lib/requestMeta";
import { CHAT_AUTH_ENABLED } from "@/lib/features";

export const dynamic = "force-dynamic";

/** Records page heartbeat, session, optional live presence and Shabbat page views. */
export async function POST(req: Request) {
  if (!hasDatabase()) return NextResponse.json({ ok: true, offline: true });

  const body = await req.json().catch(() => null);
  const path = typeof body?.path === "string" ? body.path : "/";
  const sessionId = typeof body?.sessionId === "string" ? body.sessionId : "";
  const isWatch = Boolean(body?.isWatch);
  const isShabbat = Boolean(body?.isShabbat);

  if (!sessionId || sessionId.length > 64) {
    return NextResponse.json({ error: "invalid_session" }, { status: 400 });
  }

  let userId: string | null = null;
  let userEmail: string | null = null;
  let userName: string | null = null;

  if (CHAT_AUTH_ENABLED) {
    const session = await auth();
    userId = session.userId;
    if (userId) {
      const user = await currentUser();
      userEmail = user?.primaryEmailAddress?.emailAddress ?? null;
      userName =
        user?.fullName || user?.username || user?.firstName || null;
    }
  }

  try {
    await analyticsRepo.recordPing({
      path,
      sessionId,
      isWatch,
      isShabbat,
      userId,
      userEmail,
      userName,
      ip: getClientIp(req),
      userAgent: getUserAgent(req),
      referrer: getReferrer(req),
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "record_failed" }, { status: 502 });
  }
}
