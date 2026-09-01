import { useCallback, useRef, forwardRef, useImperativeHandle } from "react";
import type { PlayerAPI, PlayerStateChange } from "../PlayerAPI";

type SoundCloudSeekEvent = {
  currentPosition?: number;
};

type SoundCloudWidget = {
  bind: (event: string, callback: (event?: SoundCloudSeekEvent) => void) => void;
  load: (
    url: string,
    options: { auto_play: boolean; callback?: () => void },
  ) => void;
  play: () => void;
  pause: () => void;
  seekTo: (position: number) => void;
  getPosition: (callback: (position: number) => void) => void;
};

type SoundCloudWidgetFactory = ((iframe: HTMLIFrameElement) => SoundCloudWidget) & {
  Events: {
    READY: string;
    PLAY: string;
    PAUSE: string;
    SEEK: string;
    FINISH: string;
    ERROR: string;
  };
};

declare global {
  interface Window {
    SC: {
      Widget: SoundCloudWidgetFactory;
    };
  }
}

const SC_SCRIPT_URL = "https://w.soundcloud.com/player/api.js";

function loadSoundCloudScript() {
  return new Promise<void>((resolve) => {
    if (window.SC) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = SC_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    document.body.appendChild(script);
  });
}

function sanitizeSoundCloudUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return url.split("?")[0];
  }
}

type Props = {
  trackUrl: string | null;
  onStateChange?: (event: PlayerStateChange) => void;
};

const SoundCloudPlayer = forwardRef<PlayerAPI, Props>(function SoundCloudPlayer(
  { trackUrl, onStateChange },
  ref,
) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const widgetRef = useRef<SoundCloudWidget | null>(null);
  const currentUrlRef = useRef<string | null>(trackUrl);

  const initWidget = useCallback(async () => {
    if (widgetRef.current || !iframeRef.current) return;

    await loadSoundCloudScript();

    const widget = window.SC.Widget(iframeRef.current);
    widgetRef.current = widget;

    const events = window.SC.Widget.Events;

    widget.bind(events.PLAY, () => {
      onStateChange?.({ data: 1 });
    });

    widget.bind(events.PAUSE, () => {
      onStateChange?.({ data: 2 });
    });

    widget.bind(events.SEEK, (event) => {
      if (event?.currentPosition !== undefined) {
        onStateChange?.({ data: 3 });
      }
    });

    widget.bind(events.FINISH, () => {
      onStateChange?.({ data: 0 });
    });
  }, [onStateChange]);

  const ensureWidget = useCallback(async () => {
    if (!widgetRef.current) {
      await initWidget();
    }
  }, [initWidget]);

  useImperativeHandle(ref, () => ({
    load: async (url: string, timestamp = 0) => {
      if (!url.includes("soundcloud.com")) {
        throw new Error(`Invalid SoundCloud URL: ${url}`);
      }

      currentUrlRef.current = url;

      await ensureWidget();

      const cleanUrl = sanitizeSoundCloudUrl(url);

      widgetRef.current?.load(cleanUrl, {
        auto_play: false,
        callback: () => {
          if (timestamp > 0) {
            widgetRef.current?.seekTo(timestamp * 1000);
          }
        },
      });
    },

    play: async () => {
      await ensureWidget();
      widgetRef.current?.play();
    },

    pause: async () => {
      await ensureWidget();
      widgetRef.current?.pause();
    },

    seek: async (time: number) => {
      await ensureWidget();
      widgetRef.current?.seekTo(time * 1000);
    },

    getTime: async () => {
      await ensureWidget();

      return new Promise<number>((resolve) => {
        widgetRef.current?.getPosition((pos: number) => {
          resolve(pos / 1000);
        });
      });
    },

    getUrl: () => {
      return currentUrlRef.current;
    },
  }), [ensureWidget]);

  return (
    <iframe
      ref={iframeRef}
      src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(
        sanitizeSoundCloudUrl(trackUrl ?? ""),
      )}&auto_play=false`}
      className="absolute inset-0 h-full w-full"
      allow="autoplay"
    />
  );
});

export default SoundCloudPlayer;
