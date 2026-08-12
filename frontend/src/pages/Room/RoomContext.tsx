import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRoom, type ConnectionStatus } from "@/websocket/useRoom";
import { getUserName, setUserName } from "@/scripts/userName";
import { getUserId, setUserId } from "@/scripts/userId";
import type { RoomController } from "@/websocket/types";
import { useEffect } from "react";

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
  showShareModal: boolean;
  setShowShareModal: (show: boolean) => void;
}

const RoomContext = createContext<RoomContextValue | null>(null);

export function RoomProvider({
  children,
  id,
}: {
  children: React.ReactNode;
  id: string | undefined;
}) {
  const navigate = useNavigate();

  const [userId, setUserIdState] = useState<string | null>(getUserId());
  const [showShareModal, setShowShareModal] = useState(false);
  const [userName, setUserNameState] = useState(() => getUserName() ?? "");

  useEffect(() => {
    const initUser = async () => {
      let id = getUserId();

      if (!id) {
        const response = await fetch(
          import.meta.env.VITE_HTTP_URL + "/api/users/create",
          {
            method: "POST",
          },
        );

        if (!response.ok) return;

        id = await response.text();
        setUserId(id);
      }

      setUserIdState(id);
    };

    initUser();
  }, []);

  if (!userId) {
    return null;
  }

  return (
    <RoomProviderContent
      id={id}
      userId={userId}
      userName={userName}
      setUserNameState={setUserNameState}
      showShareModal={showShareModal}
      setShowShareModal={setShowShareModal}
      navigate={navigate}
    >
      {children}
    </RoomProviderContent>
  );
}

function RoomProviderContent({
  children,
  id,
  userId,
  userName,
  setUserNameState,
  showShareModal,
  setShowShareModal,
  navigate,
}: {
  children: React.ReactNode;
  id: string | undefined;
  userId: string;
  userName: string;
  setUserNameState: React.Dispatch<React.SetStateAction<string>>;
  showShareModal: boolean;
  setShowShareModal: React.Dispatch<React.SetStateAction<boolean>>;
  navigate: ReturnType<typeof useNavigate>;
}) {
  const room = useRoom(id);

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
        showShareModal,
        setShowShareModal,
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
        <a
          href="/"
          className="mt-4 inline-block px-4 py-2 bg-background text-primary rounded-lg font-medium"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}

export function useRoomContext() {
  const context = useContext(RoomContext);
  if (!context)
    throw new Error("useRoomContext must be used within a RoomProvider");
  return context;
}
