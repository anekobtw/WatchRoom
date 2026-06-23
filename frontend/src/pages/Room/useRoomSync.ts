import { useEffect } from "react";
import type { PlayerAPI } from "../../types/player";
import type { WsMessage } from "../../types/ws";

const SYNC_THRESHOLD_SECONDS = 1;
const ECHO_TIMEOUT_MS = 250;

type Props = {
  playerRef: React.RefObject<PlayerAPI | null>;
  state: WsMessage | null;
  ignoreEcho: React.RefObject<boolean>;
  lastVideoRef: React.RefObject<string | null>;
};

export function useRoomSync({
  playerRef,
  state,
  ignoreEcho,
  lastVideoRef,
}: Props) {
  useEffect(() => {
    const player = playerRef.current;

    if (!player) return;
    if (!state || state.type !== "STATE") return;
    if (!state.data.videoUrl) return;

    const isNewVideo = lastVideoRef.current !== state.data.videoUrl;

    ignoreEcho.current = true;

    if (isNewVideo) {
      lastVideoRef.current = state.data.videoUrl;
      player.load(state.data.videoUrl, state.data.videoTimestamp ?? 0);
    } else {
      const currentTime = player.getTime();

      if (
        typeof state.data.videoTimestamp === "number" &&
        Math.abs(currentTime - state.data.videoTimestamp) >
          SYNC_THRESHOLD_SECONDS
      ) {
        player.seek(state.data.videoTimestamp);
      }
    }

    if (state.data.playing) {
      player.play();
    } else {
      player.pause();
    }

    const timeout = setTimeout(() => {
      ignoreEcho.current = false;
    }, ECHO_TIMEOUT_MS);

    return () => clearTimeout(timeout);
  }, [state, playerRef, ignoreEcho, lastVideoRef]);
}
