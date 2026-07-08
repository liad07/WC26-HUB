"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { VideoPlatform } from "@/lib/videoPlatform";

interface LivePlayerProps {
  src: string;
}

interface QualityLevel {
  index: number;
  height: number;
  bitrate: number;
}

const AUTO = -1;
const IOS_HIDE_MS = 6000;
const DESKTOP_HIDE_MS = 2800;

/** HLS player with tuned buffering, custom controls and quality selection. */
export function LivePlayer({ src }: LivePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playTouchHandled = useRef(false);

  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [levels, setLevels] = useState<QualityLevel[]>([]);
  const [selected, setSelected] = useState<number>(AUTO);
  const [autoHeight, setAutoHeight] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const [pip, setPip] = useState(false);
  const [pipSupported, setPipSupported] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isIOS, setIsIOS] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const retry = useCallback(() => {
    setError(false);
    setLoading(true);
    setReloadKey((k) => k + 1);
  }, []);

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 3200);
  }, []);

  useEffect(() => {
    setIsIOS(VideoPlatform.isIOS());
    setShowVolumeSlider(VideoPlatform.supportsVolumeSlider());
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.setAttribute("webkit-playsinline", "true");
    video.setAttribute("playsinline", "true");
    video.setAttribute("x-webkit-airplay", "allow");

    setError(false);
    setLoading(true);
    let recovers = 0;

    if (VideoPlatform.shouldUseNativeHls(video)) {
      if (process.env.NODE_ENV === "development") {
        console.info("[LivePlayer] native HLS path (iOS)", { src });
      }
      VideoPlatform.attachNativeHls(video, src);
    } else if (!VideoPlatform.isIOS() && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        capLevelToPlayerSize: true,
        startLevel: AUTO,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        backBufferLength: 30,
        maxBufferHole: 0.5,
        abrEwmaDefaultEstimate: 1_000_000,
        fragLoadingMaxRetry: 6,
        manifestLoadingMaxRetry: 4,
      });
      hlsRef.current = hls;

      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_e, data) => {
        const parsed: QualityLevel[] = data.levels
          .map((l, index) => ({ index, height: l.height, bitrate: l.bitrate }))
          .filter((l) => l.height > 0)
          .sort((a, b) => b.height - a.height);
        setLevels(parsed);
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (_e, data) => {
        setAutoHeight(hls.levels[data.level]?.height ?? null);
      });

      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (!data.fatal) return;
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR && recovers < 3) {
          recovers += 1;
          hls.startLoad();
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR && recovers < 3) {
          recovers += 1;
          hls.recoverMediaError();
        } else {
          setError(true);
          setLoading(false);
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      VideoPlatform.attachNativeHls(video, src);
    } else {
      setError(true);
      setLoading(false);
    }

    return () => {
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };
  }, [src, reloadKey]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onFsChange = () => setFullscreen(Boolean(document.fullscreenElement));
    const onWebkitBeginFs = () => setFullscreen(true);
    const onWebkitEndFs = () => setFullscreen(false);
    const onEnterPip = () => setPip(true);
    const onLeavePip = () => setPip(false);
    const onWebkitPresentationChange = () => setPip(VideoPlatform.isInPip(video));

    document.addEventListener("fullscreenchange", onFsChange);
    video.addEventListener("webkitbeginfullscreen", onWebkitBeginFs);
    video.addEventListener("webkitendfullscreen", onWebkitEndFs);
    video.addEventListener("enterpictureinpicture", onEnterPip);
    video.addEventListener("leavepictureinpicture", onLeavePip);
    video.addEventListener("webkitpresentationmodechanged", onWebkitPresentationChange);

    setPipSupported(VideoPlatform.supportsPip(video));

    return () => {
      document.removeEventListener("fullscreenchange", onFsChange);
      video.removeEventListener("webkitbeginfullscreen", onWebkitBeginFs);
      video.removeEventListener("webkitendfullscreen", onWebkitEndFs);
      video.removeEventListener("enterpictureinpicture", onEnterPip);
      video.removeEventListener("leavepictureinpicture", onLeavePip);
      video.removeEventListener("webkitpresentationmodechanged", onWebkitPresentationChange);
    };
  }, []);

  const pickQuality = (index: number) => {
    setSelected(index);
    setMenuOpen(false);
    if (hlsRef.current) hlsRef.current.currentLevel = index;
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => undefined);
    else video.pause();
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    const next = VideoPlatform.toggleMute(video);
    setMuted(next);
    if (!isIOS) setVolume(next ? 0 : video.volume || 1);
  };

  const changeVolume = (value: number) => {
    if (!showVolumeSlider) return;
    const video = videoRef.current;
    if (!video) return;
    video.volume = value;
    video.muted = value === 0;
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;
    VideoPlatform.enterFullscreen(video, container);
  };

  const togglePip = () => {
    const video = videoRef.current;
    if (!video) return;
    const result = VideoPlatform.togglePip(video);
    if (result === "unsupported") showToast("PiP לא נתמך במכשיר זה");
    if (result === "needs-play") {
      video.play().catch(() => undefined);
      showToast("יש להפעיל את השידור לפני PiP");
    }
    if (result === "entered") setPip(true);
    if (result === "exited") setPip(false);
  };

  const revealControls = () => {
    setControlsVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    const delay = isIOS ? IOS_HIDE_MS : DESKTOP_HIDE_MS;
    hideTimer.current = setTimeout(() => {
      if (!videoRef.current?.paused) setControlsVisible(false);
    }, delay);
  };

  const runPress = (action: () => void) => {
    revealControls();
    action();
  };

  const currentLabel =
    selected === AUTO
      ? `אוטומטי${autoHeight ? ` · ${autoHeight}p` : ""}`
      : `${levels.find((l) => l.index === selected)?.height ?? ""}p`;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-pitch-live/40 bg-pitch-live/5 px-6 py-16 text-center">
        <span className="mb-3 text-5xl">📡</span>
        <p className="text-lg font-bold text-pitch-live">השידור אינו זמין כרגע</p>
        <p className="mt-1 text-sm text-gray-400">ייתכן שהשידור הסתיים או שיש בעיית רשת.</p>
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={retry}
            className="rounded-lg bg-pitch-accent px-4 py-2 text-sm font-bold text-black transition hover:brightness-110"
          >
            נסה שוב
          </button>
          <Link
            href="/schedule"
            className="rounded-lg border border-pitch-border bg-pitch-card px-4 py-2 text-sm font-bold text-gray-200 transition hover:text-white"
          >
            חזרה ללוח המשחקים
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      dir="ltr"
      onMouseMove={revealControls}
      onTouchStart={revealControls}
      onMouseLeave={() => playing && setControlsVisible(false)}
      className="group relative overflow-hidden rounded-2xl border border-pitch-border bg-black shadow-xl shadow-black/40"
    >
      <div className="pointer-events-none absolute right-3 top-3 z-20">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-pitch-live/90 px-2.5 py-1 text-xs font-bold text-white shadow">
          <span className="h-1.5 w-1.5 animate-pulse-live rounded-full bg-white" />
          שידור חי
        </span>
      </div>

      {toast && (
        <div className="pointer-events-none absolute left-1/2 top-4 z-30 -translate-x-1/2 rounded-lg bg-black/80 px-4 py-2 text-xs font-semibold text-white shadow-lg">
          {toast}
        </div>
      )}

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={false}
        disablePictureInPicture={false}
        controls={false}
        onClick={togglePlay}
        onPlay={() => {
          setPlaying(true);
          setLoading(false);
          revealControls();
        }}
        onPause={() => {
          setPlaying(false);
          setControlsVisible(true);
        }}
        onWaiting={() => setLoading(true)}
        onPlaying={() => setLoading(false)}
        onVolumeChange={() => {
          const v = videoRef.current;
          if (!v) return;
          setMuted(v.muted);
          if (showVolumeSlider) setVolume(v.volume);
        }}
        className="aspect-video w-full cursor-pointer bg-black"
      />

      {loading && (
        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black/50">
          <span className="h-9 w-9 animate-spin rounded-full border-2 border-pitch-accent border-t-transparent" />
          <span className="text-xs text-gray-200">טוען שידור…</span>
        </div>
      )}

      {!playing && !loading && (
        <button
          type="button"
          onTouchEnd={(e) => {
            e.preventDefault();
            e.stopPropagation();
            playTouchHandled.current = true;
            runPress(togglePlay);
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (playTouchHandled.current) {
              playTouchHandled.current = false;
              return;
            }
            runPress(togglePlay);
          }}
          aria-label="נגן"
          className="absolute inset-0 z-10 flex cursor-pointer items-center justify-center bg-black/30 transition [touch-action:manipulation] [-webkit-tap-highlight-color:transparent]"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-pitch-accent text-black shadow-lg transition hover:scale-105">
            <PlayIcon size={30} />
          </span>
        </button>
      )}

      <div
        onTouchStart={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        className={`absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-3 pb-3 pt-10 transition-opacity duration-300 ${
          controlsVisible ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ControlButton onPress={() => runPress(togglePlay)} label={playing ? "השהה" : "נגן"}>
              {playing ? <PauseIcon /> : <PlayIcon />}
            </ControlButton>

            <div className="flex items-center gap-1.5">
              <ControlButton
                onPress={() => runPress(toggleMute)}
                label={muted ? "בטל השתקה" : isIOS ? "הנמכת מוזיקה" : "השתק"}
              >
                {muted || volume === 0 ? <MuteIcon /> : <VolumeIcon />}
              </ControlButton>
              {showVolumeSlider && (
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={muted ? 0 : volume}
                  onChange={(e) => changeVolume(Number(e.target.value))}
                  aria-label="עוצמת שמע"
                  className="h-1 w-16 cursor-pointer accent-pitch-accent sm:w-24"
                />
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {levels.length > 0 && (
              <div className="relative">
                <button
                  type="button"
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    runPress(() => setMenuOpen((o) => !o));
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    runPress(() => setMenuOpen((o) => !o));
                  }}
                  className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20 [touch-action:manipulation] [-webkit-tap-highlight-color:transparent]"
                >
                  <GearIcon />
                  {currentLabel}
                </button>
                {menuOpen && (
                  <div className="absolute bottom-full right-0 mb-2 w-36 overflow-hidden rounded-xl border border-pitch-border bg-pitch-card/95 py-1 text-sm shadow-2xl backdrop-blur">
                    <QualityOption active={selected === AUTO} onClick={() => pickQuality(AUTO)} label="אוטומטי" />
                    {levels.map((l) => (
                      <QualityOption
                        key={l.index}
                        active={selected === l.index}
                        onClick={() => pickQuality(l.index)}
                        label={`${l.height}p`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {pipSupported && (
              <ControlButton onPress={() => runPress(togglePip)} label="תמונה בתוך תמונה">
                <PipIcon active={pip} />
              </ControlButton>
            )}

            <ControlButton onPress={() => runPress(toggleFullscreen)} label="מסך מלא">
              {fullscreen ? <ExitFullscreenIcon /> : <FullscreenIcon />}
            </ControlButton>
          </div>
        </div>
      </div>
    </div>
  );
}

function ControlButton({
  onPress,
  label,
  children,
}: {
  onPress: () => void;
  label: string;
  children: React.ReactNode;
}) {
  const touchHandled = useRef(false);

  return (
    <button
      type="button"
      aria-label={label}
      onTouchStart={(e) => e.stopPropagation()}
      onTouchEnd={(e) => {
        e.preventDefault();
        e.stopPropagation();
        touchHandled.current = true;
        onPress();
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (touchHandled.current) {
          touchHandled.current = false;
          return;
        }
        onPress();
      }}
      className="flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-lg text-white transition hover:bg-white/15 active:bg-white/25 [touch-action:manipulation] [-webkit-tap-highlight-color:transparent]"
    >
      {children}
    </button>
  );
}

function QualityOption({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-11 w-full items-center justify-between px-3 py-2 text-right transition hover:bg-pitch-bg ${
        active ? "font-bold text-pitch-accent" : "text-gray-200"
      }`}
    >
      {label}
      {active && <span className="text-pitch-accent">✓</span>}
    </button>
  );
}

function PlayIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
    </svg>
  );
}

function VolumeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 10v4h4l5 5V5L7 10H3zm13.5 2a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4z" />
    </svg>
  );
}

function MuteIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 10v4h4l5 5V5L7 10H3zm18.3-1.3-1.4-1.4L17 10.2 14.1 7.3l-1.4 1.4L15.6 12l-2.9 2.9 1.4 1.4L17 13.4l2.9 2.9 1.4-1.4L18.4 12z" />
    </svg>
  );
}

function FullscreenIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3m8 0h3a2 2 0 0 0 2-2v-3" />
    </svg>
  );
}

function ExitFullscreenIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3M3 16h3a2 2 0 0 1 2 2v3m8 0v-3a2 2 0 0 1 2-2h3" />
    </svg>
  );
}

function PipIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="14" rx="2" opacity={active ? 0.4 : 1} />
      <rect x="12" y="10" width="8" height="6" rx="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
