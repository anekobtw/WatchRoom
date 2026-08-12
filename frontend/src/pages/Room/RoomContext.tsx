import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRoom, type ConnectionStatus } from "@/websocket/useRoom";
import { getUserName, setUserName } from "@/scripts/userName";
import { getUserId } from "@/scripts/userId";
import type { RoomController } from "@/websocket/types";

interface RoomContextValue {
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

const RoomContext = createContext<RoomContextValue | null>(null);

export function RoomProvider({ children, id }: { children: React.ReactNode; id: string | undefined }) {
  const navigate = useNavigate();
  const room = useRoom(id);
  const userId = getUserId();
  const [userName, setUserNameState] = useState(() => getUserName() ?? "");
  const handleRename = async (newName: string) => {
    setUserName(newName);
    setUserNameState(newName);

    room.send({
      type: "CONNECT",
      data: {
        roomId: id ?? "",
        userId,
        userName: newName,
      },
    });
  };
  const leaveRoom = () => {
    room.send({ type: "LEAVE" });
    navigate("/");
  };

  if (room.roomUnavailable) {
    return <RoomUnavailablePage />;
  }
  return (
    <RoomContext.Provider
      value={{
        room,
        roomId: id,
        userName,
        setUserName: handleRename,
        leaveRoom,
        userId,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
}

function RoomUnavailablePage() {
  return (
    <div className="h-screen flex items-center justify-center bg-primary text-background">
       <div className="text-center">
          <h1 className="text-2xl font-bold">Room Unavailable</h1>
          <p className="mt-2">This room does not exist or has been closed.</p>
          <a href="/" className="mt-4 inline-block px-4 py-2 bg-background text-primary rounded-lg font-medium">
            Go Home
          </a>
       </div>
    </div>
  );
}

export function useRoomContext() {
  const context = useContext(RoomContext);
  if (!context) throw new Error("useRoomContext must be used within a RoomProvider");
  return context;
}
