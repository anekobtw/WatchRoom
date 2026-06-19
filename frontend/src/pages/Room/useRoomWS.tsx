import { useEffect, useRef, useState } from "react";

type WSMessage = {
  type: string;
  roomId?: string;
  videoUrl?: string;
  videoTimestamp?: number;
  playing?: boolean;
};

export function useRoomWS(roomId: string | undefined) {
  const wsRef = useRef<WebSocket | null>(null);
  const [state, setState] = useState<any>(null);

  useEffect(() => {
    if (!roomId) return;

    const ws = new WebSocket(import.meta.env.VITE_WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "JOIN", roomId }));
    };

    ws.onmessage = (e) => {
      const msg: WSMessage = JSON.parse(e.data);

      if (msg.type === "STATE") {
        setState(msg);
      }
    };

    ws.onclose = () => {
      wsRef.current = null;
    };

    return () => {
      ws.close();
    };
  }, [roomId]);

  const send = (data: any) => {
    wsRef.current?.send(JSON.stringify(data));
  };

  return { wsRef, state, send };
}
