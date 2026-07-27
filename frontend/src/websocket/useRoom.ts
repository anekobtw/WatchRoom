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
      console.log("WebSocket connected");

      ws.send(
        JSON.stringify({
          type: "CONNECT",
          data: {
            roomId,
            userId: getUserId(),
          },
        } satisfies ClientToServer),
      );
    };

    ws.onmessage = (event) => {
      console.log("RAW:", event.data);

      try {
        const message = JSON.parse(event.data) as ServerToClient;

        if (message.type === "STATE") {
          setState(message);
        }
      } catch {
        console.error("FAILED TO PARSE:", event.data);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket closed");
      wsRef.current = null;
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [roomId]);

  const send = useCallback((message: ClientToServer) => {
    const ws = wsRef.current;

    console.log("Trying to send:", message);
    console.log("Socket state:", ws?.readyState);

    if (!ws) {
      console.error("No websocket instance");
      return;
    }

    if (ws.readyState !== WebSocket.OPEN) {
      console.error("Websocket not open");
      return;
    }

    ws.send(JSON.stringify(message));
  }, []);

  const onPlayerStateChange = useCallback(
    async ({ data }: { data: number }) => {
      if (isSyncingRef.isSyncingRef.current) return;

      const player = playerRef.current;
      if (!player) return;

      if (data !== 1 && data !== 2) return;

      const timestamp = await player.getTime();

      send({
        type: "UPDATE",
        data: {
          videoUrl: player.getUrl() ?? undefined,
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
    roomUnavailable: false,
  };
}
