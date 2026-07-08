type WebkitVideo = HTMLVideoElement & {
  webkitEnterFullscreen?: () => void;
  webkitSetPresentationMode?: (mode: "inline" | "picture-in-picture" | "fullscreen") => void;
  webkitPresentationMode?: string;
};

export class VideoPlatform {
  static isIOS(): boolean {
    if (typeof navigator === "undefined") return false;
    return (
      /iPad|iPhone|iPod/i.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
    );
  }

  static supportsNativeHls(video: HTMLVideoElement): boolean {
    return video.canPlayType("application/vnd.apple.mpegurl") !== "";
  }

  static shouldUseNativeHls(video: HTMLVideoElement): boolean {
    return this.isIOS() && this.supportsNativeHls(video);
  }

  static supportsFullscreen(video: HTMLVideoElement): boolean {
    if (typeof document === "undefined") return false;
    const webkitVideo = video as WebkitVideo;
    return Boolean(document.fullscreenEnabled || webkitVideo.webkitEnterFullscreen);
  }

  static supportsPip(video: HTMLVideoElement): boolean {
    if (typeof document === "undefined") return false;
    if (document.pictureInPictureEnabled && "requestPictureInPicture" in video) return true;
    const webkitVideo = video as WebkitVideo;
    return this.isIOS() && typeof webkitVideo.webkitSetPresentationMode === "function";
  }

  static isInPip(video: HTMLVideoElement): boolean {
    if (document.pictureInPictureElement === video) return true;
    const webkitVideo = video as WebkitVideo;
    return webkitVideo.webkitPresentationMode === "picture-in-picture";
  }

  static async enterFullscreen(video: HTMLVideoElement, container: HTMLElement): Promise<void> {
    const webkitVideo = video as WebkitVideo;

    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }

    if (this.isIOS() && webkitVideo.webkitEnterFullscreen) {
      webkitVideo.webkitEnterFullscreen();
      return;
    }

    try {
      await container.requestFullscreen();
    } catch {
      try {
        await video.requestFullscreen();
      } catch {
        webkitVideo.webkitEnterFullscreen?.();
      }
    }
  }

  static async togglePip(video: HTMLVideoElement): Promise<boolean> {
    const webkitVideo = video as WebkitVideo;

    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
      return false;
    }

    if (this.isInPip(video) && webkitVideo.webkitSetPresentationMode) {
      webkitVideo.webkitSetPresentationMode("inline");
      return false;
    }

    if (document.pictureInPictureEnabled && "requestPictureInPicture" in video) {
      await video.requestPictureInPicture();
      return true;
    }

    if (webkitVideo.webkitSetPresentationMode) {
      webkitVideo.webkitSetPresentationMode("picture-in-picture");
      return true;
    }

    return false;
  }
}
