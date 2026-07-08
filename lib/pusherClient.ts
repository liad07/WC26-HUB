"use client";

import PusherJS from "pusher-js";

let cached: PusherJS | null = null;

/** Shared browser Pusher client (singleton), or null when realtime isn't configured. */
export function getPusherClient(): PusherJS | null {
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
  if (!key || !cluster) return null;
  if (!cached) cached = new PusherJS(key, { cluster });
  return cached;
}

export const roomChannel = (roomId: string): string => `chat-${roomId}`;
export const MESSAGE_EVENT = "message";
