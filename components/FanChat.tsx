"use client";

import { CHAT_ONLINE } from "@/lib/features";
import { FanChatLocal } from "@/components/chat/FanChatLocal";
import { FanChatOnline } from "@/components/chat/FanChatOnline";

interface FanChatProps {
  roomId: string;
  title?: string;
}

/** Chat entry point: online (DB + realtime + auth) when configured, else localStorage. */
export function FanChat({ roomId, title = "צ׳אט אוהדים" }: FanChatProps) {
  return CHAT_ONLINE ? (
    <FanChatOnline roomId={roomId} title={title} />
  ) : (
    <FanChatLocal roomId={roomId} title={title} />
  );
}
