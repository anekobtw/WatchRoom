import { useState, useEffect, useRef } from "react";
import { Panel, Separator, Group, usePanelRef } from "react-resizable-panels";

import useOrientation from "@/scripts/useOrientation";
import { useRoomContext } from "./RoomContext";
import MainContent from "./MainContent";
import ChatSidebar from "./ChatSidebar";
import { ShareRoomModal } from "./components/ShareRoomModal";
import Modal from "@/components/Modal";

export default function RoomLayout() {
  const orientation = useOrientation();
  const isMobile = orientation === "vertical";
  const chatPanelRef = usePanelRef();
  const { room, showShareModal, setShowShareModal } = useRoomContext();

  const [isChatCollapsed, setIsChatCollapsed] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const lastMessageCountRef = useRef((room.state?.data?.messages ?? []).length);

  useEffect(() => {
    const messageCount = room.state?.data?.messages?.length ?? 0;

    if (messageCount > lastMessageCountRef.current && isChatCollapsed) {
      setHasUnread(true);
    }

    if (!isChatCollapsed) {
      setHasUnread(false);
    }

    lastMessageCountRef.current = messageCount;
  }, [room.state?.data?.messages?.length, isChatCollapsed]);

  const toggleChat = () => {
    const panel = chatPanelRef.current;
    if (!panel) return;

    const nextCollapsed = !panel.isCollapsed();
    nextCollapsed ? panel.collapse() : panel.expand();
    setIsChatCollapsed(nextCollapsed);
  };

  const syncChatCollapsedState = () => {
    setIsChatCollapsed(chatPanelRef.current?.isCollapsed() ?? false);
  };

  return (
    <div className="relative h-svh max-h-dvh overflow-hidden overscroll-none bg-primary font-mulish text-background">
      <Group
        orientation={orientation}
        resizeTargetMinimumSize={{ fine: 24, coarse: 36 }}
        className="h-full min-h-0"
      >
        <Panel minSize={40} className="min-h-0">
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
          className="min-h-0"
          onResize={syncChatCollapsedState}
        >
          <ChatSidebar
            isCollapsed={isChatCollapsed}
            isMobile={isMobile}
            onToggleCollapse={toggleChat}
          />
        </Panel>
      </Group>
      <ShareRoomModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />
      {room.status === "disconnected" && (
        <Modal>
          <div className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Oopsie, you got disconnected.</h2>
              <p className="text-sm text-background/70">
                This is usually caused by a network interruption, such as unstable Wi-Fi or because you don't have access to the room.
              </p>
            </div>
            <button
              onClick={room.reconnect}
              className="w-full cursor-pointer rounded-md bg-background py-2 font-medium text-primary transition hover:bg-background/90"
            >
              Reconnect
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
