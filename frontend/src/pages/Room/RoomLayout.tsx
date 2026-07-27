import { Panel, Separator, Group, usePanelRef } from "react-resizable-panels";

import useOrientation from "@/scripts/useOrientation";
import MainContent from "./MainContent";
import ChatSidebar from "./ChatSidebar";

export default function RoomLayout() {
  const orientation = useOrientation();
  const isMobile = orientation === "vertical";
  const chatPanelRef = usePanelRef();

  const toggleChat = () => {
    const panel = chatPanelRef.current;
    if (!panel) return;

    panel.isCollapsed() ? panel.expand() : panel.collapse();
  };

  const isChatCollapsed = chatPanelRef.current?.isCollapsed() ?? false;

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
