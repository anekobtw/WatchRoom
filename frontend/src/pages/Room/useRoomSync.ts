import { useCallback, useEffect, useRef } from "react";

import type { PlayerAPI } from "@/types/player";
import type { ClientToServer, ServerToClient } from "@/types/ws";
import { getConnectionId } from "@/scripts/connectionId";

const SYNC_THRESHOLD_SECONDS = 1;
const ECHO_TIMEOUT_MS = 250;

type PlayerStateChangeEvent = {
  data: number;
  time?: number;
};

export function useRoomSync({
  state,
  send,
}: {
  state: ServerToClient | null;
  send: (msg: ClientToServer) => void;
}) {
  const playerRef = useRef<PlayerAPI | null>(null);
  const ignoreEcho = useRef(false);
  const lastVideoRef = useRef<string | null>(null);

  const onPlayerStateChange = useCallback(
    async (e: PlayerStateChangeEvent) => {
      if (ignoreEcho.current && e.data !== 3) return;

      const player = playerRef.current;
      if (!player) return;

      if (e.data === 3) {
        ignoreEcho.current = true;
        send({
          type: "UPDATE",
          connectionId: getConnectionId() ?? "",
          data: {
            videoTimestamp: e.time ?? 0,
            playing: state?.data.playing,
          },
        });
        setTimeout(() => {
          ignoreEcho.current = false;
        }, ECHO_TIMEOUT_MS);
        return;
      }

      const playing = e.data === 1 ? true : e.data === 2 ? false : null;
      if (playing === null) return;

      send({
        type: "UPDATE",
        connectionId: getConnectionId() ?? "",
        data: {
          videoTimestamp: await player.getTime(),
          playing,
        },
      });
    },
    [send],
  );

  useEffect(() => {
    const sync = async () => {
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
        const currentTime = await player.getTime();

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

      return timeout;
    };

    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    sync().then((id) => {
      timeoutId = id as ReturnType<typeof setTimeout>;
    });

    return () => {
      clearTimeout(timeoutId);
    };
  }, [state]);

  return {
    playerRef,
    onPlayerStateChange,
  };
}
