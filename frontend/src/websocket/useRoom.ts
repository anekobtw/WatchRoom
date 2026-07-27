import { useCallback, useEffect, useRef, useState } from "react";
import type { PlayerAPI } from "@/components/PlayerAPI";
import type { ClientToServer, ServerToClient } from "./types";
import { getUserId } from "@/scripts/userId";
import { useVideoSync } from "./useVideoSync";

export function useRoom(roomId?: string) {
  const wsRef = useRef<WebSocket | null>(null);

  const playerRef = useRef<PlayerAPI | null>(null);
  const [state, setState] = useState<ServerToClient | null>(null);
  const isSyncingRef = useVideoSync(state, playerRef);

  useEffect(() => {
    if (!roomId || !getUserId()) return;

    const ws = new WebSocket(import.meta.env.VITE_WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      const message: ClientToServer = {
        type: "CONNECT",
        data: {
          roomId,
          userId: getUserId()!,
        },
      };

      ws.send(JSON.stringify(message));
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data) as ServerToClient;

      if (message.type === "STATE") {
        setState(message);
      }
    };

    ws.onclose = () => {
      wsRef.current = null;
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [roomId]);

  const send = useCallback((message: ClientToServer) => {
    const ws = wsRef.current;

    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    ws.send(JSON.stringify(message));
  }, []);

  const onPlayerStateChange = useCallback(
    async ({ data }: { data: number }) => {
      if (isSyncingRef.current) return;

      const player = playerRef.current;
      if (!player) return;

      if (data !== 1 && data !== 2) return;

      const timestamp = await player.getTime();

      send({
        type: "UPDATE",
        data: {
          videoUrl: player.getUrl(),
          videoTimestamp: timestamp,
          playing: data === 1,
        },
      });
    },
    [send],
  );

  return {
    state,
    send,
    playerRef,
    isSyncingRef,
    onPlayerStateChange,
  };
}
