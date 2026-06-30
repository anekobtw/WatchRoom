import { useCallback, useEffect, useRef, useState } from "react";
import type {
  ClientToServer,
  ServerToClient,
  ChatMessage,
  User,
} from "@/types/ws";
import { getClientId } from "@/scripts/getClientId";

export function useRoomWS(roomId?: string) {
  const wsRef = useRef<WebSocket | null>(null);

  const [state, setState] = useState<ServerToClient | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [users, setUsers] = useState<User[]>([]);

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
          rawPassword: "1234", // TODO: change this default password to either random generation or user input
        },
      };

      ws.send(JSON.stringify(join));
    };

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data) as ServerToClient;

      switch (msg.type) {
        case "STATE":
          setState(msg);
          break;

        case "CHAT":
          setMessages((prev) => [...prev, msg.data]);
          break;

        case "USERS":
          setUsers(msg.data.users);
          break;

        case "ERROR":
          console.log("Error occured", msg.data.errorMessage);
          break;

        default:
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

  return { state, messages, users, send };
}
