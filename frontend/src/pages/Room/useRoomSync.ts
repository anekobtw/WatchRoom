import { useEffect, RefObject } from "react";
import type { PlayerAPI } from "../../types/player";

const SYNC_THRESHOLD_SECONDS = 1;
const ECHO_TIMEOUT_MS = 250;

type RoomState = {
  videoUrl?: string;
  videoTimestamp?: number;
  playing?: boolean;
};

type Props = {
  playerRef: RefObject<PlayerAPI | null>;
  state: RoomState | null;
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

    if (!state?.videoUrl || !player) return;

    const isNewVideo = lastVideoRef.current !== state.videoUrl;

    ignoreEcho.current = true;

    if (isNewVideo) {
      lastVideoRef.current = state.videoUrl;
      player.load(state.videoUrl, state.videoTimestamp ?? 0);
    } else {
      const currentTime = player.getTime();

      if (
        typeof state.videoTimestamp === "number" &&
        Math.abs(currentTime - state.videoTimestamp) > SYNC_THRESHOLD_SECONDS
      ) {
        player.seek(state.videoTimestamp);
      }
    }

    if (state.playing) {
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
