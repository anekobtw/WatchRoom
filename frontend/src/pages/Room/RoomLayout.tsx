import { useState } from "react";
import { Group, Panel, Separator, usePanelRef } from "react-resizable-panels";
import useOrientation from "@/scripts/useOrientation";
import { getUserName, setUserName } from "@/scripts/userName";
import MainContent from "./MainContent";
import ChatSidebar from "./ChatSidebar";
import { useRoom } from "./useRoom";
import { getConnectionId } from "@/scripts/connectionId";
import { useNavigate } from "react-router-dom";

export default function RoomLayout({ id }: { id: string | undefined }) {
  const navigate = useNavigate();
  const { state, send, roomUnavailable, playerRef, onPlayerStateChange } = useRoom(id);
  const [name, setName] = useState(getUserName() ?? "");
  const [isChatCollapsed, setIsChatCollapsed] = useState(false);
  const orientation = useOrientation();
  const isMobile = orientation === "vertical";
  const chatPanelRef = usePanelRef();

  if (roomUnavailable) navigate("/404"); // Page handles 404 redirect

  const toggleChat = () => {
    const panel = chatPanelRef.current;
    if (!panel) return;
    panel.isCollapsed() ? panel.expand() : panel.collapse();
  };

  const handleRename = (newName: string) => {
    setUserName(newName);
    setName(newName);
    send({
      type: "CONNECT",
      connectionId: getConnectionId(),
      data: { roomId: id ?? "", name: newName },
    });
  };

  return (
    <div className="h-screen overflow-auto bg-primary font-mulish text-background">
      <Group
        orientation={orientation}
        resizeTargetMinimumSize={{ fine: 24, coarse: 36 }}
        className="h-full"
      >
        <Panel minSize={40}>
          <MainContent
            roomId={id}
            state={state}
            playerRef={playerRef}
            onPlayerStateChange={onPlayerStateChange}
            onLeave={() => {
              send({ type: "LEAVE", connectionId: getConnectionId(), data: null });
              navigate("/");
            }}
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
          collapsedSize={isMobile ? 70 : 0}
          collapsible
          onResize={() =>
            setIsChatCollapsed(chatPanelRef.current?.isCollapsed() ?? false)
          }
        >
          <ChatSidebar
            send={send}
            users={state?.data.users ?? []}
            messages={state?.data.messages ?? []}
            isCollapsed={isChatCollapsed}
            isMobile={isMobile}
            onToggleCollapse={toggleChat}
            name={name}
          />
        </Panel>
      </Group>
    </div>
  );
}
