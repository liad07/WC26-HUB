import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { chatRepo } from "@/lib/chatRepo";
import { hasDatabase } from "@/lib/db";
import { getPusherServer, hasPusherServer, roomChannel, MESSAGE_EVENT } from "@/lib/pusherServer";
import { CHAT_AUTH_ENABLED } from "@/lib/features";

export const dynamic = "force-dynamic";

const MAX_LEN = 500;
const RATE_WINDOW_SEC = 10;
const RATE_MAX = 8;

type RouteContext = { params: Promise<{ room: string }> };

/** Returns recent messages for a room, or only those after `?after=<id>` for polling. */
export async function GET(req: Request, { params }: RouteContext) {
  if (!hasDatabase()) return NextResponse.json({ messages: [], online: false });
  const { room } = await params;
  const after = new URL(req.url).searchParams.get("after") ?? new URL(req.url).searchParams.get("since");
  try {
    const messages = after ? await chatRepo.listAfter(room, after) : await chatRepo.list(room);
    return NextResponse.json({ messages, online: true });
  } catch (error) {
    return NextResponse.json(
      { error: "failed_to_load", message: (error as Error).message },
      { status: 502 }
    );
  }
}

/** Persists an authenticated message and broadcasts it to the room channel. */
export async function POST(req: Request, { params }: RouteContext) {
  if (!CHAT_AUTH_ENABLED || !hasDatabase()) {
    return NextResponse.json({ error: "chat_not_configured" }, { status: 503 });
  }

  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const text = typeof body?.text === "string" ? body.text.trim() : "";
  if (!text) return NextResponse.json({ error: "empty_message" }, { status: 400 });
  if (text.length > MAX_LEN) return NextResponse.json({ error: "message_too_long" }, { status: 400 });

  const recent = await chatRepo.recentCountByUser(userId, RATE_WINDOW_SEC);
  if (recent >= RATE_MAX) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const user = await currentUser();
  const name =
    user?.fullName || user?.username || user?.firstName || `אוהד ${userId.slice(-4)}`;

  const { room } = await params;
  const message = await chatRepo.insert({
    roomId: room,
    userId,
    user: name,
    avatar: user?.imageUrl ?? null,
    text,
  });

  if (hasPusherServer()) {
    await getPusherServer().trigger(roomChannel(room), MESSAGE_EVENT, message);
  }
  return NextResponse.json({ message });
}
