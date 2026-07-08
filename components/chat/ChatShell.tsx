"use client";

import { useEffect, useRef, type ReactNode } from "react";
import type { ClientMessage } from "@/lib/chatTypes";

interface ChatShellProps {
  title: string;
  subtitle: string;
  messages: ClientMessage[];
  footer: ReactNode;
  onlineBadge?: ReactNode;
}

/** Presentational chat card: header, auto-scrolling message list and a footer slot. */
export function ChatShell({ title, subtitle, messages, footer, onlineBadge }: ChatShellProps) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  return (
    <div className="card flex h-[70vh] flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div>
          <h2 className="font-black text-white">{title}</h2>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
        {onlineBadge}
      </div>

      <div ref={listRef} className="flex-1 space-y-2 overflow-y-auto px-4 py-3">
        {messages.length === 0 ? (
          <p className="mt-8 text-center text-sm text-gray-500">אין הודעות עדיין — פתחו את הדיון!</p>
        ) : (
          messages.map((m) => <MessageBubble key={m.id} message={m} />)
        )}
      </div>

      <div className="border-t border-white/10 p-3">{footer}</div>
    </div>
  );
}

function MessageBubble({ message }: { message: ClientMessage }) {
  return (
    <div className="flex gap-2.5 rounded-xl bg-white/[0.03] px-3 py-2">
      <Avatar name={message.user} src={message.avatar} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="truncate text-sm font-bold text-pitch-accent">{message.user}</span>
          <span className="shrink-0 text-[10px] text-gray-600">
            {new Date(message.ts).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
        <p className="whitespace-pre-wrap break-words text-sm text-gray-100">{message.text}</p>
      </div>
    </div>
  );
}

function Avatar({ name, src }: { name: string; src?: string | null }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={name} className="h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-white/10" />;
  }
  return (
    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-gradient text-xs font-black text-white">
      {name.trim().charAt(0) || "?"}
    </span>
  );
}
