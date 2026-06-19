import { useEffect, useRef } from "react";

export function useRoomWS(roomId: string | undefined) {
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!roomId) return;

    const url = import.meta.env.VITE_WS_URL;
    if (!url) throw new Error("VITE_WS_URL is missing");

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("Connection established");

      ws.send(
        JSON.stringify({
          type: "JOIN",
          roomId,
        }),
      );
    };

    ws.onclose = () => {
      console.log("Connection closed");
      wsRef.current = null;
    };

    ws.onerror = () => {
      console.log("WebSocket error");
    };

    return () => {
      ws.close();
    };
  }, [roomId]);

  return wsRef;
}
