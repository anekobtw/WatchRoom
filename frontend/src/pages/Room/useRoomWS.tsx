import { useEffect, useRef, useState, useCallback } from "react";

export function useRoomWS(roomId: string | undefined) {
  const wsRef = useRef<WebSocket | null>(null);

  const [state, setState] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    if (!roomId) return;

    const ws = new WebSocket(import.meta.env.VITE_WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "JOIN", roomId }));
    };

    ws.onmessage = (e) => {
      let msg: any;

      try {
        msg = JSON.parse(e.data);
      } catch {
        return;
      }

      if (msg.type === "STATE") {
        setState(msg);
        return;
      }

      if (msg.type === "CHAT") {
        setMessages((prev) => [...prev, msg]);
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

  const send = useCallback((data: any) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify(data));
  }, []);

  return { wsRef, state, messages, send };
}
