import { useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import type { PlayerAPI } from "@/types/player";

type SCWidgetEventPayload = {
  relativePosition?: number;
  loadProgress?: number;
  currentPosition?: number;
  soundId?: number;
};

type SCWidgetInstance = {
  bind: (
    eventName: string,
    listener: (payload?: SCWidgetEventPayload) => void,
  ) => void;
  unbind: (eventName: string) => void;
  load: (
    url: string,
    options?: {
      auto_play?: boolean;
      start_track?: number;
      callback?: () => void;
    },
  ) => void;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  seekTo: (milliseconds: number) => void;
  setVolume: (volume: number) => void;
  getPosition: (callback: (position: number) => void) => void;
  getDuration: (callback: (duration: number) => void) => void;
  isPaused: (callback: (paused: boolean) => void) => void;
};

type SCWidgetEvents = {
  LOAD_PROGRESS: string;
  PLAY_PROGRESS: string;
  PLAY: string;
  PAUSE: string;
  FINISH: string;
  SEEK: string;
  READY: string;
  CLICK_DOWNLOAD: string;
  CLICK_BUY: string;
  OPEN_SHARE_PANEL: string;
  ERROR: string;
};

type SCGlobal = {
  Widget: {
    (iframe: HTMLIFrameElement | string): SCWidgetInstance;
    Events: SCWidgetEvents;
  };
};

declare global {
  interface Window {
    SC: SCGlobal;
  }
}

const SC_API_URL = "https://w.soundcloud.com/player/api.js";
const DEBUG = true; // flip to false once this is confirmed working
const log = (...args: unknown[]) => DEBUG && console.log("[SCPlayer]", ...args);

// SoundCloud "share" links come with tracking params baked into the query
// string, e.g. https://soundcloud.com/user/track?in=playlist&utm_source=...
// The widget's internal URL builder does not re-encode the inner `url`
// value, so raw `&`/`?` characters in a share link get parsed as *top-level*
// query params on the widget request itself, corrupting it. Strip everything
// after the path before handing the URL to the widget.
function sanitizeSoundCloudUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    // Not a fully-qualified URL (or malformed) -- fall back to a naive
    // strip of everything from the first `?` onward.
    return url.split("?")[0];
  }
}

let scriptPromise: Promise<void> | null = null;
function loadSoundCloudScript(): Promise<void> {
  if (window.SC) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${SC_API_URL}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", reject);
      return;
    }
    const script = document.createElement("script");
    script.src = SC_API_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = reject;
    document.body.appendChild(script);
  });

  return scriptPromise;
}

type Props = {
  // Only used for the very first render, to seed the iframe's initial src.
  // Subsequent track changes should go through the imperative `load` method
  // on the ref, NOT by changing this prop -- per the SC Widget API docs,
  // widget.load() is how you switch tracks without losing bound listeners.
  trackUrl: string | null;
  onStateChange?: (e: { data: number; time?: number }) => void;
};

const SoundCloudPlayer = forwardRef<PlayerAPI, Props>(
  function SoundCloudPlayer({ trackUrl, onStateChange }, ref) {
    const iframeRef = useRef<HTMLIFrameElement | null>(null);
    const widgetRef = useRef<SCWidgetInstance | null>(null);
    const isReadyRef = useRef(false);
    const pendingRef = useRef<Array<(widget: SCWidgetInstance) => void>>([]);
    const onStateChangeRef = useRef(onStateChange);
    onStateChangeRef.current = onStateChange;

    // Create the widget exactly ONCE on mount. Per the docs, `widget.load()`
    // reloads the iframe with a new sound while keeping all bound listeners
    // intact -- so we never need to tear down / recreate SC.Widget itself.
    useEffect(() => {
      log("mounting, creating widget once");
      let cancelled = false;

      loadSoundCloudScript().then(() => {
        if (cancelled || !iframeRef.current) {
          log("cancelled or iframe gone before script resolved");
          return;
        }

        const widget = window.SC.Widget(iframeRef.current);
        widgetRef.current = widget;

        widget.bind(window.SC.Widget.Events.READY, () => {
          log(
            "READY fired, flushing",
            pendingRef.current.length,
            "queued calls",
          );
          if (cancelled) return;
          isReadyRef.current = true;
          const queued = pendingRef.current;
          pendingRef.current = [];
          queued.forEach((fn) => fn(widget));
        });

        widget.bind(window.SC.Widget.Events.PLAY, () => {
          log("widget PLAY event");
          onStateChangeRef.current?.({ data: 1 });
        });
        widget.bind(window.SC.Widget.Events.PAUSE, () => {
          log("widget PAUSE event");
          onStateChangeRef.current?.({ data: 2 });
        });
        widget.bind(window.SC.Widget.Events.SEEK, (e) => {
          log("widget SEEK event", e);
          if (e?.currentPosition !== undefined) {
            onStateChangeRef.current?.({ data: 3, time: e.currentPosition / 1000 });
          }
        });
        widget.bind(window.SC.Widget.Events.FINISH, () => {
          log("widget FINISH event");
          onStateChangeRef.current?.({ data: 0 });
        });
        widget.bind(window.SC.Widget.Events.ERROR, (e) => {
          log("widget ERROR event", e);
        });
      });

      return () => {
        log("unmounting");
        cancelled = true;
        isReadyRef.current = false;
        widgetRef.current = null;
      };
      // Intentionally empty: widget is created once per mounted iframe.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Runs fn against the widget immediately if READY has already fired,
    // otherwise queues it to run once READY fires.
    const withWidget = (
      label: string,
      fn: (widget: SCWidgetInstance) => void,
    ) => {
      const widget = widgetRef.current;
      log(
        label,
        "called. isReady =",
        isReadyRef.current,
        "hasWidget =",
        !!widget,
      );
      if (isReadyRef.current && widget) {
        fn(widget);
      } else {
        log(label, "queued (not ready yet)");
        pendingRef.current.push(fn);
      }
    };

    useImperativeHandle(ref, () => ({
      load: (url: string, timestamp = 0) => {
        if (!url.includes("soundcloud.com")) {
          throw new Error(`Invalid SoundCloud URL: ${url}`);
        }
        const cleanUrl = sanitizeSoundCloudUrl(url);
        log("load: raw url =", url, "-> sanitized =", cleanUrl);
        withWidget("load", (widget) => {
          widget.load(cleanUrl, {
            auto_play: false,
            start_track: 0,
            callback: () => {
              log("load callback fired (new track ready)");
              if (timestamp > 0) {
                widget.seekTo(timestamp * 1000);
              }
            },
          });
        });
      },
      play: () => {
        withWidget("play", (widget) => {
          log("-> widget.play()");
          widget.play();
        });
      },
      pause: () => {
        withWidget("pause", (widget) => {
          log("-> widget.pause()");
          widget.pause();
        });
      },
      seek: (time: number) => {
        withWidget("seek", (widget) => {
          log("-> widget.seekTo()", time * 1000);
          widget.seekTo(time * 1000);
          onStateChangeRef.current?.({ data: 3, time });
        });
      },
      getTime: () => {
        return new Promise<number>((resolve) => {
          const widget = widgetRef.current;
          if (!isReadyRef.current || !widget) {
            resolve(0);
            return;
          }
          widget.getPosition((position) => {
            resolve(position / 1000);
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
  },
);

export default SoundCloudPlayer;
