import { useCallback, useState } from "react";
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
  const { room, roomId } = useRoomContext();
  const messageCount = room.state?.data?.messages?.length ?? 0;
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isChatCollapsed, setIsChatCollapsed] = useState(false);
  const [lastReadMessageCount, setLastReadMessageCount] = useState(messageCount);
  const hasUnread = isChatCollapsed && messageCount > lastReadMessageCount;

  const openShareModal = useCallback(() => {
    setIsShareModalOpen(true);
  }, []);

  const toggleChat = () => {
    const panel = chatPanelRef.current;
    if (!panel) return;

    const nextCollapsed = !panel.isCollapsed();
    if (nextCollapsed) {
      panel.collapse();
    } else {
      panel.expand();
      setLastReadMessageCount(messageCount);
    }

    setIsChatCollapsed(nextCollapsed);
  };

  const syncChatCollapsedState = () => {
    const panel = chatPanelRef.current;
    if (!panel) return;

    const collapsed = panel.isCollapsed();
    setIsChatCollapsed(collapsed);

    if (!collapsed) {
      setLastReadMessageCount(messageCount);
    }
  };

  return (
    <div className="relative h-dvh overflow-hidden overscroll-none bg-primary font-mulish text-background">
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
            onOpenShareModal={openShareModal}
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
            hasUnread={hasUnread}
          />
        </Panel>
      </Group>
      <ShareRoomModal
        isOpen={isShareModalOpen}
        roomId={roomId}
        onClose={() => setIsShareModalOpen(false)}
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
