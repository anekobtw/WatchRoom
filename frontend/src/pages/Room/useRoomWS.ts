import { useCallback, useEffect, useRef, useState } from "react";

import type {
  ChatMessage,
  ClientToServer,
  ServerToClient,
  User,
} from "@/types/ws";
import { getConnectionId } from "@/scripts/connectionId";

export function useRoomWS(name: string | null, roomId?: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const receivedStateRef = useRef(false);

  const [state, setState] = useState<ServerToClient | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [roomUnavailable, setRoomUnavailable] = useState(false);

  useEffect(() => {
    if (!roomId || !name) return;

    let disposed = false;
    receivedStateRef.current = false;
    setState(null);
    setMessages([]);
    setUsers([]);
    setRoomUnavailable(false);

    const ws = new WebSocket(import.meta.env.VITE_WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      const join: ClientToServer = {
        type: "CONNECT",
        connectionId: getConnectionId() ?? "",
        data: {
          roomId,
          name,
        },
      };

      ws.send(JSON.stringify(join));
    };

    ws.onmessage = (e) => {
      if (disposed) return;

      const msg = JSON.parse(e.data) as ServerToClient;

      switch (msg.type) {
        case "STATE":
          receivedStateRef.current = true;
          setRoomUnavailable(false);
          setState(msg);
          if (msg.data.messages) {
            setMessages(msg.data.messages);
          }
          if (msg.data.users) {
            setUsers(msg.data.users);
          }
          break;

        default:
          return;
      }
    };

    ws.onerror = () => {
      if (!disposed && !receivedStateRef.current) {
        setRoomUnavailable(true);
      }
    };

    ws.onclose = () => {
      wsRef.current = null;

      if (!disposed && !receivedStateRef.current) {
        setRoomUnavailable(true);
      }
    };

    return () => {
      disposed = true;
      ws.close();
      wsRef.current = null;
    };
  }, [roomId, !!name]);


  const send = useCallback((msg: ClientToServer) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify(msg));
  }, []);

  useEffect(() => {
    if (!roomId || !name) return;

    send({
      type: "CONNECT",
      connectionId: getConnectionId() ?? "",
      data: {
        roomId,
        name,
      },
    });
  }, [name, roomId, send]);



  return { state, messages, users, send, roomUnavailable };
}
