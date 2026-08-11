import { useCallback, useEffect, useRef, useState } from "react";
import type { PlayerAPI } from "@/components/PlayerAPI";
import type { ClientToServer, ServerToClient } from "./types";
import { getUserId } from "@/scripts/userId";
import { getUserName } from "@/scripts/userName";
import { useVideoSync } from "./useVideoSync";

export function useRoom(roomId?: string) {
  const wsRef = useRef<WebSocket | null>(null);

  const playerRef = useRef<PlayerAPI | null>(null);
  const [state, setState] = useState<ServerToClient | null>(null);
  const isSyncingRef = useVideoSync(state, playerRef);

  const connect = useCallback((userName: string) => {
    if (!roomId || !getUserId()) return;
    if (wsRef.current) return;

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
            userName,
          },
        } satisfies ClientToServer),
      );
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === "STATE") {
        setState(msg);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
      wsRef.current = null;
      setState(null);
    };
  }, [roomId]);

  useEffect(() => {
    const name = getUserName() || "Guest";
    connect(name);
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);

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
    connect,
    send,
    playerRef,
    isSyncingRef,
    onPlayerStateChange,
    roomUnavailable: false,
  };
}
