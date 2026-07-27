import { useState } from "react";
import { Panel, Separator, Group, usePanelRef } from "react-resizable-panels";
import { useNavigate } from "react-router-dom";

import useOrientation from "@/scripts/useOrientation";
import { getUserName, setUserName } from "@/scripts/userName";
import { getUserId } from "@/scripts/userId";

import MainContent from "./MainContent";
import ChatSidebar from "./ChatSidebar";
import { useRoom } from "@/websocket/useRoom";

export default function RoomLayout({ id }: { id: string | undefined }) {
  const navigate = useNavigate();

  const room = useRoom(id);

  const [name, setName] = useState(getUserName() ?? "");
  const [isChatCollapsed, setIsChatCollapsed] = useState(false);

  const orientation = useOrientation();
  const isMobile = orientation === "vertical";

  const chatPanelRef = usePanelRef();

  if (room.roomUnavailable) {
    navigate("/404");
  }

  const toggleChat = () => {
    const panel = chatPanelRef.current;

    if (!panel) return;

    panel.isCollapsed() ? panel.expand() : panel.collapse();
  };

  const handleRename = (newName: string) => {
    setUserName(newName);
    setName(newName);

    room.send({
      type: "CONNECT",
      data: {
        roomId: id ?? "",
        userId: getUserId(),
        name: newName,
      },
    });
  };

  const leaveRoom = () => {
    room.send({
      type: "LEAVE",
      data: null,
    });

    navigate("/");
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
            room={room}
            roomId={id}
            onLeave={leaveRoom}
            onRename={handleRename}
            isChatCollapsed={isChatCollapsed}
            isMobile={isMobile}
            onExpandChat={toggleChat}
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
            room={room}
            userId={getUserId()}
            users={room.state?.data.users ?? []}
            messages={room.state?.data.messages ?? []}
            isCollapsed={isChatCollapsed}
            isMobile={isMobile}
            onToggleCollapse={toggleChat}
          />
        </Panel>
      </Group>
    </div>
  );
}
