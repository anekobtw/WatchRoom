import {
  useEffect,
  useRef,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from "react";
import YouTube from "react-youtube";
import type { PlayerAPI } from "../../types/player";

const YOUTUBE_ID_REGEX =
  /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/;
const BARE_ID_REGEX = /^[\w-]{11}$/;

function extractYouTubeId(url?: string | null): string | null {
  if (!url) return null;
  const match = url.match(YOUTUBE_ID_REGEX);
  if (match) return match[1];
  return BARE_ID_REGEX.test(url) ? url : null; // allow a bare ID too
}

type Props = {
  videoId: string | null; // accepts either a raw video ID or a full YouTube URL
  onStateChange?: (e: any) => void;
};

const YouTubePlayer = forwardRef<PlayerAPI, Props>(function YouTubePlayer(
  { videoId, onStateChange },
  ref,
) {
  const playerRef = useRef<any>(null);
  const resolvedId = useMemo(() => extractYouTubeId(videoId), [videoId]);

  useImperativeHandle(ref, () => ({
    load: (url: string, timestamp = 0) => {
      const id = extractYouTubeId(url);
      if (!id) return;
      playerRef.current?.loadVideoById(id, timestamp);
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
      return playerRef.current?.getCurrentTime?.() ?? 0;
    },
  }));

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
      onReady={(e) => (playerRef.current = e.target)}
      onStateChange={onStateChange}
    />
  );
});
export default YouTubePlayer;
