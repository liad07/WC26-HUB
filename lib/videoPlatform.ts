type WebkitVideo = HTMLVideoElement & {
  webkitEnterFullscreen?: () => void;
  webkitSetPresentationMode?: (mode: "inline" | "picture-in-picture" | "fullscreen") => void;
  webkitPresentationMode?: string;
  webkitSupportsPresentationMode?: (mode: string) => boolean;
};

export type PipResult = "entered" | "exited" | "unsupported" | "needs-play";

export class VideoPlatform {
  static isIOS(): boolean {
    if (typeof navigator === "undefined") return false;
    const ua = navigator.userAgent;
    return (
      /iPad|iPhone|iPod/i.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) ||
      (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1)
    );
  }

  static isIOSSafari(): boolean {
    if (!this.isIOS()) return false;
    const ua = navigator.userAgent;
    if (/CriOS|FxiOS|EdgiOS|OPiOS|DuckDuckGo/i.test(ua)) return false;
    return /Safari/i.test(ua) || /AppleWebKit/i.test(ua);
  }

  static supportsNativeHls(video: HTMLVideoElement): boolean {
    return video.canPlayType("application/vnd.apple.mpegurl") !== "";
  }

  static shouldUseNativeHls(video: HTMLVideoElement): boolean {
    return this.isIOS() && this.supportsNativeHls(video);
  }

  static supportsVolumeSlider(): boolean {
    return !this.isIOS();
  }

  static attachNativeHls(video: HTMLVideoElement, src: string): void {
    video.removeAttribute("src");
    video.src = src;
    video.load();
  }

  static supportsFullscreen(video: HTMLVideoElement): boolean {
    if (typeof document === "undefined") return false;
    const webkitVideo = video as WebkitVideo;
    return Boolean(document.fullscreenEnabled || webkitVideo.webkitEnterFullscreen);
  }

  static supportsWebkitPip(video: HTMLVideoElement): boolean {
    const webkitVideo = video as WebkitVideo;
    if (typeof webkitVideo.webkitSetPresentationMode !== "function") return false;
    if (typeof webkitVideo.webkitSupportsPresentationMode === "function") {
      return webkitVideo.webkitSupportsPresentationMode("picture-in-picture");
    }
    return this.isIOS();
  }

  static supportsPip(video: HTMLVideoElement): boolean {
    if (typeof document === "undefined") return false;
    if (this.supportsWebkitPip(video)) return true;
    return Boolean(document.pictureInPictureEnabled && "requestPictureInPicture" in video);
  }

  static isInPip(video: HTMLVideoElement): boolean {
    if (document.pictureInPictureElement === video) return true;
    const webkitVideo = video as WebkitVideo;
    return webkitVideo.webkitPresentationMode === "picture-in-picture";
  }

  static toggleMute(video: HTMLVideoElement): boolean {
    video.muted = !video.muted;
    return video.muted;
  }

  static enterFullscreen(video: HTMLVideoElement, container: HTMLElement): void {
    const webkitVideo = video as WebkitVideo;

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => undefined);
      return;
    }

    if (this.isIOS() && webkitVideo.webkitEnterFullscreen) {
      webkitVideo.webkitEnterFullscreen();
      return;
    }

    container.requestFullscreen().catch(() => {
      video.requestFullscreen().catch(() => {
        webkitVideo.webkitEnterFullscreen?.();
      });
    });
  }

  static togglePip(video: HTMLVideoElement): PipResult {
    if (this.isInPip(video)) {
      return this.exitPip(video) ? "exited" : "unsupported";
    }
    return this.enterPip(video);
  }

  static enterPip(video: HTMLVideoElement): PipResult {
    if (video.paused && video.readyState < 2) {
      return "needs-play";
    }

    if (video.paused) {
      video.play().catch(() => undefined);
    }

    if (this.supportsWebkitPip(video)) {
      const webkitVideo = video as WebkitVideo;
      webkitVideo.webkitSetPresentationMode!("picture-in-picture");
      return "entered";
    }

    if (document.pictureInPictureEnabled && "requestPictureInPicture" in video) {
      video.requestPictureInPicture().catch(() => undefined);
      return "entered";
    }

    if (this.isIOS() && (video as WebkitVideo).webkitEnterFullscreen) {
      (video as WebkitVideo).webkitEnterFullscreen!();
      return "entered";
    }

    return "unsupported";
  }

  static exitPip(video: HTMLVideoElement): boolean {
    const webkitVideo = video as WebkitVideo;

    if (webkitVideo.webkitPresentationMode === "picture-in-picture" && webkitVideo.webkitSetPresentationMode) {
      webkitVideo.webkitSetPresentationMode("inline");
      return true;
    }

    if (document.pictureInPictureElement === video) {
      document.exitPictureInPicture().catch(() => undefined);
      return true;
    }

    return false;
  }
}
