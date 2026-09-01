import { useEffect, useRef } from "react";
import type { PlayerAPI } from "@/components/PlayerAPI";
import type { ServerToClient } from "./types";

const SYNC_THRESHOLD_SECONDS = 1;

export function useVideoSync(
  state: ServerToClient | null,
  playerRef: React.RefObject<PlayerAPI | null>,
  player: PlayerAPI | null,
) {
  const isSyncingRef = useRef(false);

  useEffect(() => {
    const sync = async () => {
      const player = playerRef.current;

      if (!player || !state || state.type !== "STATE") {
        return;
      }

      const { videoUrl, videoTimestamp = 0, playing } = state.data;

      if (!videoUrl) {
        return;
      }

      try {
        isSyncingRef.current = true;

        const currentUrl = player.getUrl();

        if (currentUrl !== videoUrl) {
          player.load(videoUrl, videoTimestamp);
        } else {
          const currentTime = await player.getTime();

          if (Math.abs(currentTime - videoTimestamp) > SYNC_THRESHOLD_SECONDS) {
            player.seek(videoTimestamp);
          }
        }

        if (playing) {
          player.play();
        } else {
          player.pause();
        }
      } finally {
        isSyncingRef.current = false;
      }
    };

    sync();
  }, [player, playerRef, state]);

  return isSyncingRef;
}
