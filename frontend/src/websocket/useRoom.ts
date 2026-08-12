import { useCallback, useEffect, useRef, useState } from "react";
import type { PlayerAPI } from "@/components/PlayerAPI";
import type { ClientToServer, ServerToClient } from "./types";
import { getUserId } from "@/scripts/userId";
import { getUserName } from "@/scripts/userName";
import { useVideoSync } from "./useVideoSync";

export type ConnectionStatus = "connected" | "reconnecting" | "disconnected";

export function useRoom(roomId?: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const statusRef = useRef<ConnectionStatus>("disconnected");
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");

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
      reconnectAttemptsRef.current = 0;
      statusRef.current = "connected";
      setStatus("connected");
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

      if (statusRef.current === "connected" || statusRef.current === "reconnecting") {
        if (reconnectAttemptsRef.current < 3) {
          statusRef.current = "reconnecting";
          setStatus("reconnecting");
          reconnectAttemptsRef.current++;
          setTimeout(() => {
            connect(getUserName() || "Guest");
          }, 2000);
        } else {
          statusRef.current = "disconnected";
          setStatus("disconnected");
        }
      }
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
    status,
    reconnect: () => {
      reconnectAttemptsRef.current = 0;
      connect(getUserName() || "Guest");
    },
  };
}
