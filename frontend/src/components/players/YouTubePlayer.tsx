import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import YouTube, {
  type YouTubeEvent,
  type YouTubePlayer as YouTubePlayerInstance,
} from "react-youtube";
import type { PlayerAPI, PlayerStateChange } from "../PlayerAPI";

const YOUTUBE_ID_REGEX =
  /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/;
const BARE_ID_REGEX = /^[\w-]{11}$/;

function extractYouTubeId(url?: string | null): string | null {
  if (!url) return null;

  const match = url.match(YOUTUBE_ID_REGEX);

  if (match) return match[1];

  return BARE_ID_REGEX.test(url) ? url : null;
}

type Props = {
  videoId: string | null;
  onStateChange?: (event: PlayerStateChange) => void;
};

const YouTubePlayer = forwardRef<PlayerAPI, Props>(function YouTubePlayer(
  { videoId, onStateChange },
  ref,
) {
  const playerRef = useRef<YouTubePlayerInstance | null>(null);

  const sourceUrlRef = useRef(videoId);

  useEffect(() => {
    sourceUrlRef.current = videoId;
  }, [videoId]);
  const resolvedId = extractYouTubeId(videoId);

  useImperativeHandle(ref, () => ({
    load: (url: string, timestamp = 0) => {
      const id = extractYouTubeId(url);

      if (!id) {
        throw new Error(`Invalid YouTube URL: ${url}`);
      }

      playerRef.current?.loadVideoById(id, timestamp);

      sourceUrlRef.current = url;
    },

    play: () => {
      playerRef.current?.playVideo();
    },

    pause: () => {
      playerRef.current?.pauseVideo();
    },

    seek: (time: number) => {
      playerRef.current?.seekTo(time, true);
    },

    getTime: () => {
      return playerRef.current?.getCurrentTime() ?? 0;
    },

    getUrl: () => {
      return sourceUrlRef.current;
    },
  }), []);

  return (
    <YouTube
      videoId={resolvedId ?? undefined}
      opts={{
        width: "100%",
        height: "100%",
        playerVars: {
          rel: 0,
          modestbranding: 1,
        },
      }}
      className="absolute inset-0 h-full w-full"
      iframeClassName="h-full w-full"
      onReady={(event: YouTubeEvent<number>) => {
        playerRef.current = event.target;
      }}
      onStateChange={onStateChange}
    />
  );
});

export default YouTubePlayer;
