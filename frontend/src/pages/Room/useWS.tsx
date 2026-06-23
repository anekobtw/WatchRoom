import { useEffect, useRef, useState, useCallback } from "react";
import type { WsMessage, OutgoingMessage } from "../../types/ws";

export function useRoomWS(roomId: string | undefined) {
  const wsRef = useRef<WebSocket | null>(null);

  const [state, setState] = useState<WsMessage | null>(null);
  const [messages, setMessages] = useState<WsMessage[]>([]);

  useEffect(() => {
    if (!roomId) return;

    const ws = new WebSocket(import.meta.env.VITE_WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "JOIN", data: { roomId } }));
    };

    ws.onmessage = (e) => {
      let msg: WsMessage;

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
        return;
      }

      if (msg.type === "ERROR") {
        setMessages((prev) => [...prev, msg]);
      }
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [roomId]);

  const send = useCallback((data: OutgoingMessage) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    ws.send(JSON.stringify(data));
  }, []);

  return { state, messages, send };
}
