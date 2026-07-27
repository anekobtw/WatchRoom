import { ArrowLeftFromLine } from "lucide-react";

import Player from "@/components/Player";
import type { RoomController } from "@/websocket/types";

import UserControls from "./components/UserControls";
import VideoInput from "./components/VideoInput";

type Props = {
  room: RoomController;
  roomId?: string;
  onLeave: () => void;
  onRename: (name: string) => void;
  isChatCollapsed: boolean;
  isMobile: boolean;
  onExpandChat: () => void;
};

export default function MainContent({
  room,
  roomId,
  onLeave,
  onRename,
  isChatCollapsed,
  isMobile,
  onExpandChat,
}: Props) {
  const videoUrl =
    room.state?.type === "STATE" ? room.state.data.videoUrl : null;

  return (
    <main className="flex h-full min-w-0 flex-1 flex-col overflow-y-auto bg-primary font-mulish text-background">
      <div className="grid grid-cols-1 gap-4 px-6 py-5 lg:grid-cols-[auto_1fr_auto] lg:items-center">
        <UserControls
          roomId={roomId}
          userCount={room.state?.data.users?.length ?? 0}
          onLeave={onLeave}
          onRename={onRename}
        />

        <VideoInput send={room.send} />

        <div className="flex justify-end">
          {!isMobile && isChatCollapsed && (
            <button
              onClick={onExpandChat}
              className="rounded-xl p-2 hover:bg-primary-surface-1"
            >
              <ArrowLeftFromLine />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 p-6">
        <div className="relative h-full overflow-hidden rounded-2xl border border-line bg-primary-surface-0 shadow-2xl">
          {videoUrl ? (
            <Player
              ref={room.playerRef}
              url={videoUrl}
              onStateChange={room.onPlayerStateChange}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              Nothing is in the queue
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
