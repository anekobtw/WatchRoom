import { forwardRef } from "react";
import type { PlayerAPI, PlayerStateChange } from "./PlayerAPI";
import YouTubePlayer from "./players/YouTubePlayer";

type Props = {
  url: string;
  onStateChange?: (event: PlayerStateChange) => void;
};

function isYouTubeUrl(url: string) {
  return (
    url.includes("youtube.com") ||
    url.includes("youtu.be") ||
    /^[\w-]{11}$/.test(url)
  );
}

const Player = forwardRef<PlayerAPI, Props>(function Player(
  { url, onStateChange },
  ref,
) {
  const isYouTube = isYouTubeUrl(url);

  if (!isYouTube) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        Unsupported player
      </div>
    );
  }

  return <YouTubePlayer ref={ref} videoId={url} onStateChange={onStateChange} />;
});

export default Player;
