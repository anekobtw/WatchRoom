import { forwardRef } from "react";
import type { PlayerAPI } from "./PlayerAPI";
import YouTubePlayer from "./players/YouTubePlayer";
import SoundCloudPlayer from "./players/SoundCloudPlayer";

type Props = {
  url: string;
  onStateChange?: (event: any) => void;
};

function getPlayer(url: string) {
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    return YouTubePlayer;
  }

  if (url.includes("soundcloud.com")) {
    return SoundCloudPlayer;
  }

  return null;
}

const Player = forwardRef<PlayerAPI, Props>(function Player(
  { url, onStateChange },
  ref,
) {
  const Component = getPlayer(url);

  if (!Component) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        Unsupported player
      </div>
    );
  }

  if (Component === YouTubePlayer) {
    return <Component ref={ref} videoId={url} onStateChange={onStateChange} />;
  }

  if (Component === SoundCloudPlayer) {
    return <Component ref={ref} trackUrl={url} onStateChange={onStateChange} />;
  }

  return null;
});

export default Player;
