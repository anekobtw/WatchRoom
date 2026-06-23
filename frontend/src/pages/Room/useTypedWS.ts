import { useCallback, useEffect, useRef, useState } from "react";
import type {
  ClientToServer,
  ServerToClient,
  ChatMessage,
} from "../../types/ws";
import { getClientId } from "../../../scripts/getClientId";

export function useTypedWS(roomId?: string) {
  const wsRef = useRef<WebSocket | null>(null);

  const [state, setState] = useState<ServerToClient | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (!roomId) return;

    const ws = new WebSocket(import.meta.env.VITE_WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      const join: ClientToServer = {
        type: "JOIN",
        data: {
          roomId,
          clientId: getClientId(),
          rawPassword: "1234",
        },
      };

      ws.send(JSON.stringify(join));
    };

    ws.onmessage = (e) => {
      let msg: ServerToClient;

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
        setMessages((prev) => [
          ...prev,
          {
            text: msg.data.text,
            ts: msg.data.ts,
            senderClientId: msg.data.senderClientId,
          },
        ]);
        return;
      }
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [roomId]);

  const send = useCallback((msg: ClientToServer) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify(msg));
  }, []);

  return { state, messages, send };
}
