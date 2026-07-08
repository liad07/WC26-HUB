import "server-only";
import Pusher from "pusher";

let cached: Pusher | null = null;

export const hasPusherServer = (): boolean =>
  !!(
    process.env.PUSHER_APP_ID &&
    process.env.PUSHER_SECRET &&
    process.env.NEXT_PUBLIC_PUSHER_KEY &&
    process.env.NEXT_PUBLIC_PUSHER_CLUSTER
  );

/** Lazily builds the server Pusher client used to broadcast chat messages. */
export function getPusherServer(): Pusher {
  if (!hasPusherServer()) throw new Error("Pusher server env is not configured");
  if (!cached) {
    cached = new Pusher({
      appId: process.env.PUSHER_APP_ID!,
      key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
      secret: process.env.PUSHER_SECRET!,
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      useTLS: true,
    });
  }
  return cached;
}

/** Channel name for a chat room (public, subscribe-only for clients). */
export const roomChannel = (roomId: string): string => `chat-${roomId}`;
export const MESSAGE_EVENT = "message";
