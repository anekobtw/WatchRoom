import { useState, type SubmitEvent } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Group, Panel, Separator } from "react-resizable-panels";

import Modal from "@/components/Modal";
import { getConnectionId } from "@/scripts/connectionId";
import { getUserName, setUserName } from "@/scripts/userName";

import MainContent from "./MainContent";
import ChatSidebar from "./ChatSidebar";
import { useRoomSync } from "./useRoomSync";
import { useRoomWS } from "./useRoomWS";

export default function Room() {
  const navigate = useNavigate();
  const { id } = useParams();
  const storedName = getUserName();
  const [name, setName] = useState(storedName ?? "");
  const [submittedName, setSubmittedName] = useState<string | null>(
    storedName,
  );

  const { state, messages, users, send, roomUnavailable } = useRoomWS(
    submittedName,
    id,
  );

  const { playerRef, onPlayerStateChange } = useRoomSync({
    state,
    send,
  });

  const handleContinue = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) return;

    setUserName(trimmedName);
    setName(trimmedName);
    setSubmittedName(trimmedName);
  };

  const handleLeave = () => {
    send({
      type: "LEAVE",
      connectionId: getConnectionId() ?? "",
      data: null,
    });
    navigate("/");
  };

  if (roomUnavailable) {
    return <Navigate replace to="/404" />;
  }

  return (
    <div className="fade-1 h-screen overflow-hidden bg-primary font-mulish text-background">
      <Group orientation="horizontal" className="h-full">
        {!submittedName && (
          <Modal>
            <form className="space-y-4" onSubmit={handleContinue}>
              <h2 className="text-xl font-semibold">What's your name?</h2>

              <input
                type="text"
                placeholder="Enter your name"
                className="w-full rounded-md border border-border px-3 py-2"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />

              <button
                type="submit"
                className="w-full cursor-pointer rounded-md bg-background py-2 font-medium text-primary transition duration-200 hover:bg-surface-1 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!name.trim()}
              >
                Continue
              </button>
            </form>
          </Modal>
        )}

        <Panel minSize={40}>
          <MainContent
            roomId={id}
            users={users}
            state={state}
            playerRef={playerRef}
            onPlayerStateChange={onPlayerStateChange}
            onLeave={handleLeave}
            currentName={submittedName}
          />
        </Panel>

        <Separator />

        <Panel defaultSize={350} minSize={15} collapsible collapsedSize={4}>
          <ChatSidebar send={send} messages={messages} />
        </Panel>
      </Group>
    </div>
  );
}
