import { useState, type SubmitEvent } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Group, Panel, Separator, usePanelRef } from "react-resizable-panels";

import Modal from "@/components/Modal";
import useOrientation from "@/scripts/useOrientation";
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
  const [submittedName, setSubmittedName] = useState<string | null>(storedName);
  const [isChatCollapsed, setIsChatCollapsed] = useState(false);

  const orientation = useOrientation();
  const isMobile = orientation === "vertical";

  const chatPanelRef = usePanelRef();

  const { state, messages, users, send, roomUnavailable } = useRoomWS(
    submittedName,
    id,
  );

  const { playerRef, onPlayerStateChange } = useRoomSync({ state, send });

  const handleContinue = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) return;

    setUserName(trimmedName);
    setName(trimmedName);
    setSubmittedName(trimmedName);
  };

  const connectionId = getConnectionId();
  if (!connectionId) return null;

  const handleLeave = () => {
    send({
      type: "LEAVE",
      connectionId,
      data: null,
    });
    navigate("/");
  };

  const toggleChat = () => {
    const panel = chatPanelRef.current;
    if (!panel) return;

    panel.isCollapsed() ? panel.expand() : panel.collapse();
  };

  if (roomUnavailable) {
    return <Navigate replace to="/404" />;
  }

  const handleRename = (newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed || trimmed === submittedName) return;

    setUserName(trimmed);
    setName(trimmed);
    setSubmittedName(trimmed);
  };

  return (
    <div className="fade-1 h-screen overflow-hidden bg-primary font-mulish text-background">
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

      <Group
        orientation={orientation}
        resizeTargetMinimumSize={{ fine: 24, coarse: 36 }}
        className="h-full"
      >
        <Panel minSize={40}>
          <MainContent
            roomId={id}
            users={users}
            state={state}
            playerRef={playerRef}
            onPlayerStateChange={onPlayerStateChange}
            onLeave={handleLeave}
            currentName={submittedName}
            isChatCollapsed={isChatCollapsed}
            isMobile={isMobile}
            onExpandChat={toggleChat}
            onRename={handleRename}
            send={send}
          />
        </Panel>

        <Separator />

        <Panel
          panelRef={chatPanelRef}
          defaultSize={350}
          minSize={isMobile ? 60 : 0}
          collapsedSize={isMobile ? 60 : 0}
          collapsible
          onResize={() =>
            setIsChatCollapsed(chatPanelRef.current?.isCollapsed() ?? false)
          }
        >
          <ChatSidebar
            send={send}
            messages={messages}
            isCollapsed={isChatCollapsed}
            isMobile={isMobile}
            onToggleCollapse={toggleChat}
          />
        </Panel>
      </Group>
    </div>
  );
}
