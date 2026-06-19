import { useEffect, useRef } from "react";

export function useRoomWS(roomId: string | undefined) {
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!roomId) return;

    const ws = new WebSocket(import.meta.env.WS_URL);
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
      console.log("Connection closed due to error");
      ws.close();
    };

    return () => {
      ws.close();
    };
  }, [roomId]);

  return wsRef;
}
