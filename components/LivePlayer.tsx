"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import Hls from "hls.js";

interface LivePlayerProps {
  src: string;
}

interface QualityLevel {
  index: number;
  height: number;
  bitrate: number;
}

const AUTO = -1;

/** HLS player with tuned buffering, custom controls and quality selection. */
export function LivePlayer({ src }: LivePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const retry = useCallback(() => {
    setError(false);
    setLoading(true);
    setReloadKey((k) => k + 1);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setError(false);
    setLoading(true);
    let recovers = 0;

    if (Hls.isSupported()) {
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
      video.src = src;
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
    const onFsChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFsChange);
    setPipSupported(
      typeof document !== "undefined" && document.pictureInPictureEnabled === true
    );

    const video = videoRef.current;
    const onEnterPip = () => setPip(true);
    const onLeavePip = () => setPip(false);
    video?.addEventListener("enterpictureinpicture", onEnterPip);
    video?.addEventListener("leavepictureinpicture", onLeavePip);

    return () => {
      document.removeEventListener("fullscreenchange", onFsChange);
      video?.removeEventListener("enterpictureinpicture", onEnterPip);
      video?.removeEventListener("leavepictureinpicture", onLeavePip);
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
    video.muted = !video.muted;
  };

  const changeVolume = (value: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = value;
    video.muted = value === 0;
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else containerRef.current?.requestFullscreen().catch(() => undefined);
  };

  const togglePip = async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement) await document.exitPictureInPicture();
      else await video.requestPictureInPicture();
    } catch {
      /* ignore unsupported / user-gesture errors */
    }
  };

  const revealControls = () => {
    setControlsVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (!videoRef.current?.paused) setControlsVisible(false);
    }, 2800);
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
      onMouseLeave={() => playing && setControlsVisible(false)}
      className="group relative overflow-hidden rounded-2xl border border-pitch-border bg-black shadow-xl shadow-black/40"
    >
      <div className="pointer-events-none absolute right-3 top-3 z-20">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-pitch-live/90 px-2.5 py-1 text-xs font-bold text-white shadow">
          <span className="h-1.5 w-1.5 animate-pulse-live rounded-full bg-white" />
          שידור חי
        </span>
      </div>

      <video
        ref={videoRef}
        autoPlay
        playsInline
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
          setVolume(v.volume);
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
          onClick={togglePlay}
          aria-label="נגן"
          className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 transition"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-pitch-accent text-black shadow-lg transition hover:scale-105">
            <PlayIcon size={30} />
          </span>
        </button>
      )}

      <div
        className={`absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-3 pb-3 pt-10 transition-opacity duration-300 ${
          controlsVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ControlButton onClick={togglePlay} label={playing ? "השהה" : "נגן"}>
              {playing ? <PauseIcon /> : <PlayIcon />}
            </ControlButton>

            <div className="flex items-center gap-1.5">
              <ControlButton onClick={toggleMute} label={muted ? "בטל השתקה" : "השתק"}>
                {muted || volume === 0 ? <MuteIcon /> : <VolumeIcon />}
              </ControlButton>
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
            </div>
          </div>

          <div className="flex items-center gap-2">
            {levels.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20"
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
              <ControlButton onClick={togglePip} label="תמונה בתוך תמונה">
                <PipIcon active={pip} />
              </ControlButton>
            )}

            <ControlButton onClick={toggleFullscreen} label="מסך מלא">
              {fullscreen ? <ExitFullscreenIcon /> : <FullscreenIcon />}
            </ControlButton>
          </div>
        </div>
      </div>
    </div>
  );
}

function ControlButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-lg text-white transition hover:bg-white/15"
    >
      {children}
    </button>
  );
}

function QualityOption({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center justify-between px-3 py-2 text-right transition hover:bg-pitch-bg ${
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
