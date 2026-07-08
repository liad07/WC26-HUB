"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";

const DISMISS_KEY = "wchub-pwa-install-dismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/** One-time install banner for supported browsers (Android/desktop Chrome). */
export function PwaInstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(DISMISS_KEY)) return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
    setDeferred(null);
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    dismiss();
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-md lg:bottom-6 lg:left-6 lg:right-auto">
      <div className="card flex items-center gap-3 p-4 shadow-glow">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-gradient">
          <Icon name="bolt" size={18} className="text-white" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-white">התקן אפליקציה</p>
          <p className="text-xs text-gray-400">World Cup Hub במסך הבית</p>
        </div>
        <button type="button" onClick={install} className="btn-primary shrink-0 px-3 py-2 text-xs">
          התקן
        </button>
        <button type="button" onClick={dismiss} className="btn-ghost shrink-0 px-2 py-2" aria-label="סגור">
          <Icon name="close" size={16} />
        </button>
      </div>
    </div>
  );
}
