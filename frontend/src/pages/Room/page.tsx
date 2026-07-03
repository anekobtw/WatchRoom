import { useParams } from "react-router-dom";
import { Panel, Group, Separator } from "react-resizable-panels";

import { useRoomSync } from "./useRoomSync";
import { useRoomWS } from "./useRoomWS";

import MainContent from "./MainContent";
import ChatSidebar from "./ChatSidebar";

export default function Room() {
  const { id } = useParams();

  const { state, messages, users, send } = useRoomWS(id);

  const { playerRef, onPlayerStateChange } = useRoomSync({
    state,
    send,
  });

  return (
    <div className="fade-1 h-screen overflow-hidden bg-background font-inter text-primary">
      <Group orientation="horizontal" className="h-full">
        <Panel minSize={40}>
          <MainContent
            roomId={id}
            users={users}
            state={state}
            playerRef={playerRef}
            onPlayerStateChange={onPlayerStateChange}
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
