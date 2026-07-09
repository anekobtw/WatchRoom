import { useCallback, useEffect, useRef, useState } from "react";

import type { PlayerAPI } from "@/components/PlayerAPI";
import type { ClientToServer, ServerToClient } from "@/types/ws";
import { getConnectionId } from "@/scripts/connectionId";
import { getUserName } from "@/scripts/userName";

const SYNC_THRESHOLD_SECONDS = 1;
const ECHO_TIMEOUT_MS = 250;

export function useRoom(roomId?: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const receivedStateRef = useRef(false);
  const playerRef = useRef<PlayerAPI | null>(null);
  const lastVideoRef = useRef<string | null>(null);
  const ignoreEcho = useRef(false);

  const [state, setState] = useState<ServerToClient | null>(null);
  const [roomUnavailable, setRoomUnavailable] = useState(false);

  useEffect(() => {
    if (!roomId || !getUserName()) return;

    let disposed = false;
    receivedStateRef.current = false;
    setState(null);
    setRoomUnavailable(false);

    const ws = new WebSocket(import.meta.env.VITE_WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      const join: ClientToServer = {
        type: "CONNECT",
        connectionId: getConnectionId() ?? "",
        data: { roomId, name: getUserName() ?? "" },
      };
      ws.send(JSON.stringify(join));
    };

    ws.onmessage = (e) => {
      if (disposed) return;
      const msg = JSON.parse(e.data) as ServerToClient;
      if (msg.type === "STATE") {
        receivedStateRef.current = true;
        setRoomUnavailable(false);
        setState(msg);
      }
    };

    ws.onerror = () => {
      if (!disposed && !receivedStateRef.current) setRoomUnavailable(true);
    };

    ws.onclose = () => {
      wsRef.current = null;
      if (!disposed && !receivedStateRef.current) setRoomUnavailable(true);
    };

    return () => {
      disposed = true;
      ws.close();
      wsRef.current = null;
    };
  }, [roomId, !!getUserName()]);

  const send = useCallback((msg: ClientToServer) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify(msg));
  }, []);

  useEffect(() => {
    const sync = async () => {
      const player = playerRef.current;
      if (!player || !state || state.type !== "STATE" || !state.data.videoUrl)
        return;

      if (ignoreEcho.current) return;

      const { videoUrl, videoTimestamp = 0, playing } = state.data;
      const isNewVideo = lastVideoRef.current !== videoUrl;

      if (isNewVideo) {
        lastVideoRef.current = videoUrl;
        player.load(videoUrl, videoTimestamp);
      } else {
        const currentTime = await player.getTime();
        if (Math.abs(currentTime - videoTimestamp) > SYNC_THRESHOLD_SECONDS) {
          player.seek(videoTimestamp);
        }
      }
      playing ? player.play() : player.pause();
    };

    sync();
  }, [state]);

  const onPlayerStateChange = useCallback(
    async ({ data, time }: { data: number; time?: number }) => {
      if (ignoreEcho.current && data !== 3) return;

      const player = playerRef.current;
      if (!player) return;

      if (data === 3) {
        ignoreEcho.current = true;
        setTimeout(() => {
          ignoreEcho.current = false;
        }, ECHO_TIMEOUT_MS);
        send({
          type: "UPDATE",
          connectionId: getConnectionId() ?? "",
          data: {
            videoTimestamp: time ?? 0,
            playing: state?.data.playing ?? false,
          },
        });
        return;
      }

      if (data !== 1 && data !== 2) return;
      send({
        type: "UPDATE",
        connectionId: getConnectionId() ?? "",
        data: { videoTimestamp: await player.getTime(), playing: data === 1 },
      });
    },
    [send, state?.data.playing],
  );

  return { state, send, roomUnavailable, playerRef, onPlayerStateChange };
}
