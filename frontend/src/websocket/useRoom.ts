import { useCallback, useEffect, useRef, useState } from "react";
import type { PlayerAPI, PlayerStateChange } from "@/components/PlayerAPI";
import type { ClientToServer, RoomStateMessage, ServerToClient } from "./types";
import { getUserId } from "@/scripts/userId";
import { getUserName } from "@/scripts/userName";
import { useVideoSync } from "./useVideoSync";

export type ConnectionStatus = "connected" | "reconnecting" | "disconnected";

export function useRoom(roomId?: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const connectRef = useRef<(userName: string) => void>(() => {});
  const mountedRef = useRef(true);
  const statusRef = useRef<ConnectionStatus>("reconnecting");
  const [status, setStatus] = useState<ConnectionStatus>("reconnecting");
  const roomUnavailableRef = useRef(false);
  const [roomUnavailable, setRoomUnavailable] = useState(false);
  const [player, setPlayer] = useState<PlayerAPI | null>(null);
  const playerRef = useRef<PlayerAPI | null>(null);
  const [state, setState] = useState<RoomStateMessage | null>(null);

  useEffect(() => {
    playerRef.current = player;
  }, [player]);

  const isSyncingRef = useVideoSync(state, playerRef, player);

  const connect = useCallback(
    (userName: string) => {
      if (!mountedRef.current || !roomId || !getUserId() || roomUnavailableRef.current) {
        return;
      }

      if (wsRef.current) return;

      const ws = new WebSocket(import.meta.env.VITE_WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!mountedRef.current || wsRef.current !== ws) return;

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
        const message: ServerToClient = JSON.parse(event.data);

        if (message.type === "STATE") {
          setState(message);
          return;
        }

        if (message.type === "ERROR" && message.data.code === "ROOM_NOT_FOUND") {
          roomUnavailableRef.current = true;
          setRoomUnavailable(true);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      ws.onclose = () => {
        if (wsRef.current === ws) {
          wsRef.current = null;
        }

        if (!mountedRef.current) return;

        setState(null);

        if (roomUnavailableRef.current) return;

        if (
          (statusRef.current === "connected" || statusRef.current === "reconnecting") &&
          reconnectAttemptsRef.current === 0
        ) {
          reconnectAttemptsRef.current = 1;
          statusRef.current = "reconnecting";
          setStatus("reconnecting");
          reconnectTimerRef.current = setTimeout(() => {
            reconnectTimerRef.current = null;

            if (mountedRef.current) {
              connectRef.current(getUserName() || "Guest");
            }
          }, 2000);
          return;
        }

        statusRef.current = "disconnected";
        setStatus("disconnected");
      };
    },
    [roomId],
  );

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  useEffect(() => {
    mountedRef.current = true;
    connect(getUserName() || "Guest");

    return () => {
      mountedRef.current = false;

      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }

      const ws = wsRef.current;
      wsRef.current = null;
      ws?.close();
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

    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    reconnectAttemptsRef.current = 0;
    statusRef.current = "reconnecting";
    setStatus("reconnecting");
    connectRef.current(getUserName() || "Guest");
  }, []);

  const onPlayerStateChange = useCallback(
    async ({ data }: PlayerStateChange) => {
      if (isSyncingRef.current || (data !== 1 && data !== 2)) return;

      const currentPlayer = playerRef.current;
      if (!currentPlayer) return;

      const timestamp = await currentPlayer.getTime();
      send({
        type: "UPDATE",
        data: {
          videoUrl: currentPlayer.getUrl() ?? undefined,
          videoTimestamp: timestamp,
          playing: data === 1,
        },
      });
    },
    [isSyncingRef, send],
  );

  return {
    state,
    connect,
    send,
    setPlayer,
    onPlayerStateChange,
    roomUnavailable,
    status,
    reconnect,
  };
}
