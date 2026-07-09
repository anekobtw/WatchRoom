import { useRef, forwardRef, useImperativeHandle } from "react";
import type { PlayerAPI } from "../PlayerAPI";

declare global {
  interface Window {
    SC: {
      Widget: ((iframe: HTMLIFrameElement) => any) & {
        Events: {
          READY: string;
          PLAY: string;
          PAUSE: string;
          SEEK: string;
          FINISH: string;
          ERROR: string;
        };
      };
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
  onStateChange?: (e: { data: number; time?: number }) => void;
};

const SoundCloudPlayer = forwardRef<PlayerAPI, Props>(function SoundCloudPlayer(
  { trackUrl, onStateChange },
  ref,
) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const widgetRef = useRef<any>(null);

  // Initialize widget and bind events
  const initWidget = async () => {
    if (widgetRef.current || !iframeRef.current) return;

    await loadSoundCloudScript();

    const widget = window.SC.Widget(iframeRef.current);
    widgetRef.current = widget;

    const events = window.SC.Widget.Events;
    widget.bind(events.PLAY, () => onStateChange?.({ data: 1 }));
    widget.bind(events.PAUSE, () => onStateChange?.({ data: 2 }));
    widget.bind(events.SEEK, (e: any) => {
      if (e?.currentPosition !== undefined) {
        onStateChange?.({ data: 3, time: e.currentPosition / 1000 });
      }
    });
    widget.bind(events.FINISH, () => onStateChange?.({ data: 0 }));
  };

  // Trigger init on first interaction or mount
  const ensureWidget = async () => {
    if (!widgetRef.current) {
      await initWidget();
    }
  };

  useImperativeHandle(ref, () => ({
    load: async (url: string, timestamp = 0) => {
      if (!url.includes("soundcloud.com")) {
        throw new Error(`Invalid SoundCloud URL: ${url}`);
      }
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
      onStateChange?.({ data: 3, time });
    },
    getTime: async () => {
      await ensureWidget();
      return new Promise<number>((resolve) => {
        widgetRef.current?.getPosition((pos: number) => {
          resolve(pos / 1000);
        });
      });
    },
  }));

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
