import { useCallback, useEffect, useRef, useState } from "react";
import type { PlayerAPI } from "@/components/PlayerAPI";
import type { ClientToServer, RoomStateMessage, ServerToClient } from "./types";
import { getUserId } from "@/scripts/userId";
import { getUserName } from "@/scripts/userName";
import { useVideoSync } from "./useVideoSync";

export type ConnectionStatus = "connected" | "reconnecting" | "disconnected";

export function useRoom(roomId?: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const statusRef = useRef<ConnectionStatus>("reconnecting");
  const [status, setStatus] = useState<ConnectionStatus>("reconnecting");

  const roomUnavailableRef = useRef(false);
  const [roomUnavailable, setRoomUnavailable] = useState(false);

  const playerRef = useRef<PlayerAPI | null>(null);
  const [state, setState] = useState<RoomStateMessage | null>(null);
  const isSyncingRef = useVideoSync(state, playerRef);

  const connect = useCallback((userName: string) => {
    if (!roomId || !getUserId() || roomUnavailableRef.current) return;
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
      const msg: ServerToClient = JSON.parse(event.data);
      if (msg.type === "STATE") {
        setState(msg);
        return;
      }

      if (msg.type === "ERROR" && msg.data.code === "ROOM_NOT_FOUND") {
        roomUnavailableRef.current = true;
        setRoomUnavailable(true);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
      wsRef.current = null;
      setState(null);

      if (roomUnavailableRef.current) {
        return;
      }

      if (
        (statusRef.current === "connected" || statusRef.current === "reconnecting") &&
        reconnectAttemptsRef.current === 0
      ) {
        reconnectAttemptsRef.current = 1;
        statusRef.current = "reconnecting";
        setStatus("reconnecting");
        setTimeout(() => connect(getUserName() || "Guest"), 2000);
        return;
      }

      statusRef.current = "disconnected";
      setStatus("disconnected");
    };
  }, [roomId]);

  useEffect(() => {
    roomUnavailableRef.current = false;
    setRoomUnavailable(false);
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

  const reconnect = useCallback(() => {
    if (wsRef.current || roomUnavailableRef.current) return;
    reconnectAttemptsRef.current = 0;

    statusRef.current = "reconnecting";
    setStatus("reconnecting");
    connect(getUserName() || "Guest");
  }, [connect]);
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
    roomUnavailable,
    status,
    reconnect,
  };
}
