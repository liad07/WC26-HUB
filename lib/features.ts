/**
 * Client-safe capability flags derived from public env vars. Server secrets
 * (DATABASE_URL, CLERK_SECRET_KEY, PUSHER_SECRET) are validated where used.
 */
export const CHAT_AUTH_ENABLED = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export const CHAT_REALTIME_ENABLED =
  !!process.env.NEXT_PUBLIC_PUSHER_KEY && !!process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

/**
 * Online mode only needs Clerk auth; realtime (Pusher) is an optional enhancement.
 * Without Pusher the client falls back to polling, so DB + auth are enough.
 */
export const CHAT_ONLINE = CHAT_AUTH_ENABLED;
