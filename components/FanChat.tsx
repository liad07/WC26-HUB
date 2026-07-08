"use client";

import { useEffect, useRef } from "react";
import { CHAT_ONLINE } from "@/lib/features";
import { FanChatLocal } from "@/components/chat/FanChatLocal";
import { FanChatOnline } from "@/components/chat/FanChatOnline";
import { useShabbat } from "@/components/shabbat/ShabbatProvider";

interface FanChatProps {
  roomId: string;
  title?: string;
}

/** Chat entry point: online (DB + realtime + auth) when configured, else localStorage. */
export function FanChat({ roomId, title = "צ׳אט אוהדים" }: FanChatProps) {
  const { isShabbat } = useShabbat();
  const blockedChat = useRef(false);

  useEffect(() => {
    if (!isShabbat || blockedChat.current) return;
    blockedChat.current = true;
    const sessionId = sessionStorage.getItem("wc26_sid") ?? "";
    void fetch("/api/analytics/shabbat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventType: "blocked_chat", sessionId, path: window.location.pathname }),
    });
  }, [isShabbat]);

  return CHAT_ONLINE ? (
    <FanChatOnline roomId={roomId} title={title} readOnly={isShabbat} />
  ) : (
    <FanChatLocal roomId={roomId} title={title} readOnly={isShabbat} />
  );
}
