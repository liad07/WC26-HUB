"use client";

import { useEffect, useMemo, useState } from "react";
import { ChatShell } from "@/components/chat/ChatShell";
import { QUICK_REPLIES, type ClientMessage } from "@/lib/chatTypes";

const NAME_KEY = "mundial:chat:name";

/** Offline fallback chat persisted to the current browser's localStorage. */
export function FanChatLocal({ roomId, title }: { roomId: string; title: string }) {
  const storageKey = useMemo(() => `mundial:chat:${roomId}`, [roomId]);
  const [messages, setMessages] = useState<ClientMessage[]>([]);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setName(localStorage.getItem(NAME_KEY) ?? "");
    try {
      setMessages(JSON.parse(localStorage.getItem(storageKey) ?? "[]"));
    } catch {
      setMessages([]);
    }
    setReady(true);
  }, [storageKey]);

  useEffect(() => {
    if (ready) localStorage.setItem(storageKey, JSON.stringify(messages));
  }, [messages, storageKey, ready]);

  const send = (body: string) => {
    const trimmed = body.trim();
    if (!trimmed) return;
    const author = name.trim() || "אנונימי";
    if (name.trim()) localStorage.setItem(NAME_KEY, name.trim());
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), user: author, text: trimmed, ts: Date.now() },
    ]);
    setText("");
  };

  return (
    <ChatShell title={title} subtitle="ההודעות נשמרות מקומית בדפדפן שלך" messages={messages}
      footer={
        <>
          <QuickReplies onPick={send} />
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="השם שלך"
            className="mb-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-pitch-brand/50 focus:outline-none"
          />
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
              className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-pitch-brand/50 focus:outline-none"
            />
            <button type="submit" disabled={!text.trim()} className="btn-primary px-4 disabled:opacity-40">
              שלח
            </button>
          </form>
        </>
      }
    />
  );
}

export function QuickReplies({ onPick }: { onPick: (text: string) => void }) {
  return (
    <div className="mb-2 flex flex-wrap gap-1.5">
      {QUICK_REPLIES.map((q) => (
        <button
          key={q}
          onClick={() => onPick(q)}
          className="rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-gray-300 transition hover:text-pitch-accent"
        >
          {q}
        </button>
      ))}
    </div>
  );
}
