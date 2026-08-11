import { useState, useEffect, useRef } from "react";
import { Panel, Separator, Group, usePanelRef } from "react-resizable-panels";

import useOrientation from "@/scripts/useOrientation";
import { useRoomContext } from "./RoomContext";
import MainContent from "./MainContent";
import ChatSidebar from "./ChatSidebar";

export default function RoomLayout() {
  const orientation = useOrientation();
  const isMobile = orientation === "vertical";
  const chatPanelRef = usePanelRef();
  const { room } = useRoomContext();
  const messages = room.state?.data?.messages ?? [];

  const [isChatCollapsed, setIsChatCollapsed] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const lastMessageCountRef = useRef(messages.length);
  useEffect(() => {
    const panel = chatPanelRef.current;
    if (!panel) return;

    const updateCollapsedState = () => {
      setIsChatCollapsed(panel.isCollapsed());
    };

    updateCollapsedState();
  }, [chatPanelRef]);

  useEffect(() => {
    if (messages.length > lastMessageCountRef.current && isChatCollapsed) {
      setHasUnread(true);
    }
    lastMessageCountRef.current = messages.length;
  }, [messages.length, isChatCollapsed]);

  useEffect(() => {
    if (!isChatCollapsed) {
      setHasUnread(false);
    }
  }, [isChatCollapsed]);
  const toggleChat = () => {
    const panel = chatPanelRef.current;
    if (!panel) return;

    const nextCollapsed = !panel.isCollapsed();
    nextCollapsed ? panel.collapse() : panel.expand();
    setIsChatCollapsed(nextCollapsed);
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
            isChatCollapsed={isChatCollapsed}
            isMobile={isMobile}
            onExpandChat={toggleChat}
            hasUnread={hasUnread}
          />
        </Panel>

        <Separator />

        <Panel
          panelRef={chatPanelRef}
          defaultSize={350}
          minSize={isMobile ? 60 : 0}
          collapsedSize={isMobile ? 70 : 0}
          collapsible
        >
          <ChatSidebar
            isCollapsed={isChatCollapsed}
            isMobile={isMobile}
            onToggleCollapse={toggleChat}
          />
        </Panel>
      </Group>
    </div>
  );
}
