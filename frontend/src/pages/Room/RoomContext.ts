import { createContext, useContext } from "react";
import type { RoomController } from "@/websocket/types";
import type { ConnectionStatus } from "@/websocket/useRoom";

export interface RoomContextValue {
  room: RoomController & {
    status: ConnectionStatus;
    reconnect: () => void;
  };
  roomId: string | undefined;
  userName: string;
  setUserName: (name: string) => void;
  leaveRoom: () => void;
  userId: string;
}

export const RoomContext = createContext<RoomContextValue | null>(null);

export function useRoomContext() {
  const context = useContext(RoomContext);

  if (!context) {
    throw new Error("useRoomContext must be used within a RoomProvider");
  }

  return context;
}
