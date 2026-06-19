import { useEffect, useRef, useState, useCallback } from "react";

type WSMessage =
  | {
      type: "STATE";
      videoUrl?: string;
      videoTimestamp?: number;
      playing?: boolean;
    }
  | { type: "CHAT"; text: string; ts: number; roomId?: string };

export function useRoomWS(roomId: string | undefined) {
  const wsRef = useRef<WebSocket | null>(null);

  const [state, setState] = useState<any>(null);
  const [messages, setMessages] = useState<WSMessage[]>([]);

  useEffect(() => {
    if (!roomId) return;

    const ws = new WebSocket(import.meta.env.VITE_WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "JOIN", roomId }));
    };

    ws.onmessage = (e) => {
      let msg: WSMessage;
      try {
        msg = JSON.parse(e.data);
      } catch {
        return;
      }

      if (msg.type === "STATE") setState(msg);
      else if (msg.type === "CHAT") setMessages((p) => [...p, msg]);
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

  return { state, messages, send };
}
