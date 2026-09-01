import { useEffect, useState, type ReactNode } from "react";
import { useNavigate, type NavigateFunction } from "react-router-dom";
import { ensureUserId } from "@/api/rooms";
import { getUserName, setUserName } from "@/scripts/userName";
import { useRoom } from "@/websocket/useRoom";
import { RoomContext } from "./RoomContext";

export function RoomProvider({
  children,
  id,
}: {
  children: ReactNode;
  id: string | undefined;
}) {
  const navigate = useNavigate();
  const [userId, setUserIdState] = useState<string | null>(null);
  const [initializationAttempt, setInitializationAttempt] = useState(0);
  const [initializationError, setInitializationError] = useState(false);
  const [userName, setUserNameState] = useState(() => getUserName() ?? "");

  useEffect(() => {
    let active = true;

    void ensureUserId().then(
      (id) => {
        if (!active) return;
        setUserIdState(id);
        setInitializationError(false);
      },
      () => {
        if (active) setInitializationError(true);
      },
    );

    return () => {
      active = false;
    };
  }, [initializationAttempt]);

  if (initializationError) {
    return (
      <div className="h-screen flex items-center justify-center bg-primary text-background">
        <div className="text-center">
          <p role="alert">Unable to prepare your session. Please try again.</p>
          <button
            type="button"
            className="mt-4 px-4 py-2 bg-background text-primary rounded-lg font-medium"
            onClick={() => {
              setInitializationError(false);
              setInitializationAttempt((attempt) => attempt + 1);
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div
        className="h-screen flex items-center justify-center bg-primary text-background"
        role="status"
      >
        Preparing your session...
      </div>
    );
  }

  return (
    <RoomProviderContent
      id={id}
      userId={userId}
      userName={userName}
      setUserNameState={setUserNameState}
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
  navigate,
}: {
  children: ReactNode;
  id: string | undefined;
  userId: string;
  userName: string;
  setUserNameState: (name: string) => void;
  navigate: NavigateFunction;
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
