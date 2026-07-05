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

  console.log("roomId: " + state?.data.roomId);
  console.log("videoUrl: " + state?.data.videoUrl);
  console.log("videoTimestamp: " + state?.data.videoTimestamp);
  console.log("playing: " + state?.data.playing);
  if (state?.data.users != undefined) {
    console.log("User 0 name: " + state?.data.users[0].name);
    console.log("User 0 clientId: " + state?.data.users[0].clientId);
  }

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
