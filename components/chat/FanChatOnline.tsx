"use client";

import { useEffect, useRef, useState } from "react";
import { SignInButton, useUser } from "@clerk/nextjs";
import { ChatShell } from "@/components/chat/ChatShell";
import { QuickReplies } from "@/components/chat/FanChatLocal";
import { getPusherClient, roomChannel, MESSAGE_EVENT } from "@/lib/pusherClient";
import { CHAT_REALTIME_ENABLED } from "@/lib/features";
import type { ClientMessage } from "@/lib/chatTypes";

const POLL_INTERVAL_MS = 2000;

/** Shared chat: history from Postgres, live updates via Pusher when set, else polling. */
export function FanChatOnline({ roomId, title, readOnly = false }: { roomId: string; title: string; readOnly?: boolean }) {
  const { isSignedIn } = useUser();
  const [messages, setMessages] = useState<ClientMessage[]>([]);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const lastIdRef = useRef("0");

  useEffect(() => {
    let active = true;
    lastIdRef.current = "0";

    const merge = (incoming: ClientMessage[]) => {
      if (!incoming.length) return;
      for (const m of incoming) {
        if (Number(m.id) > Number(lastIdRef.current)) lastIdRef.current = m.id;
      }
      setMessages((prev) => {
        const seen = new Set(prev.map((x) => x.id));
        const added = incoming.filter((m) => !seen.has(m.id));
        return added.length ? [...prev, ...added] : prev;
      });
    };

    fetch(`/api/chat/${encodeURIComponent(roomId)}`)
      .then((r) => r.json())
      .then((d) => {
        if (active && Array.isArray(d.messages)) merge(d.messages);
      })
      .catch(() => {});

    if (CHAT_REALTIME_ENABLED) {
      const pusher = getPusherClient();
      if (pusher) {
        const channel = pusher.subscribe(roomChannel(roomId));
        const onMessage = (m: ClientMessage) => merge([m]);
        channel.bind(MESSAGE_EVENT, onMessage);
        return () => {
          active = false;
          channel.unbind(MESSAGE_EVENT, onMessage);
          pusher.unsubscribe(roomChannel(roomId));
        };
      }
    }

    const poll = async () => {
      if (!active || document.hidden) return;
      try {
        const url = `/api/chat/${encodeURIComponent(roomId)}?after=${encodeURIComponent(lastIdRef.current)}`;
        const d = await (await fetch(url)).json();
        if (active && Array.isArray(d.messages)) merge(d.messages);
      } catch {}
    };
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    const onVisible = () => {
      if (!document.hidden) poll();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      active = false;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [roomId]);

  const send = async (body: string) => {
    if (readOnly) return;
    const trimmed = body.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch(`/api/chat/${encodeURIComponent(roomId)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed }),
      });
      if (res.ok) {
        setText("");
      } else {
        const data = await res.json().catch(() => ({}));
        setError(errorLabel(data.error));
      }
    } catch {
      setError("שגיאת רשת, נסו שוב");
    } finally {
      setSending(false);
    }
  };

  return (
    <ChatShell
      title={title}
      subtitle="צ׳אט אונליין — משותף לכל האוהדים בזמן אמת"
      messages={messages}
      onlineBadge={
        <span className="inline-flex items-center gap-1.5 rounded-full bg-pitch-accent/15 px-2.5 py-0.5 text-xs font-bold text-pitch-accent">
          <span className="h-2 w-2 animate-pulse-live rounded-full bg-pitch-accent" />
          אונליין
        </span>
      }
      footer={
        readOnly ? (
          <p className="text-center text-sm text-gray-500">הצ׳אט אינו פעיל בשבת קודש · שבת שלום</p>
        ) : isSignedIn ? (
          <>
            {error && <p className="mb-2 text-xs font-semibold text-pitch-live">{error}</p>}
            <QuickReplies onPick={send} />
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(text);
              }}
              className="flex gap-2"
            >
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="כתבו הודעה…"
                maxLength={500}
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-pitch-brand/50 focus:outline-none"
              />
              <button type="submit" disabled={!text.trim() || sending} className="btn-primary px-4 disabled:opacity-40">
                שלח
              </button>
            </form>
          </>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-gray-400">התחברו כדי להצטרף לדיון</p>
            <SignInButton mode="modal">
              <button className="btn-primary">התחברות</button>
            </SignInButton>
          </div>
        )
      }
    />
  );
}

function errorLabel(code?: string): string {
  switch (code) {
    case "rate_limited":
      return "האטו קצת — נשלחו יותר מדי הודעות";
    case "message_too_long":
      return "ההודעה ארוכה מדי";
    case "unauthorized":
      return "צריך להתחבר כדי לשלוח";
    default:
      return "לא ניתן לשלוח כרגע, נסו שוב";
  }
}
