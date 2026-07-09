import { ArrowLeftFromLine } from "lucide-react";
import Player from "@/components/Player";
import type { PlayerAPI } from "@/components/PlayerAPI";
import type { ServerToClient, ClientToServer } from "@/types/ws";
import UserControls from "./components/UserControls";
import VideoInput from "./components/VideoInput";

type MainContentProps = {
  roomId?: string;
  state: ServerToClient | null;
  playerRef: React.RefObject<PlayerAPI | null>;
  onPlayerStateChange: (event: { data: number }) => void;
  onLeave: () => void;
  isChatCollapsed: boolean;
  isMobile: boolean;
  onExpandChat: () => void;
  onRename: (name: string) => void;
  send: (msg: ClientToServer) => void;
};

export default function MainContent({
  roomId,
  state,
  playerRef,
  onPlayerStateChange,
  onLeave,
  isChatCollapsed,
  isMobile,
  onExpandChat,
  onRename,
  send,
}: MainContentProps) {
  return (
    <main className="flex h-full min-w-0 flex-1 flex-col bg-primary font-mulish text-background">
      <div className="grid grid-cols-1 gap-4 px-6 py-5 lg:grid-cols-[auto_1fr_auto] lg:items-center">
        <UserControls
          roomId={roomId}
          userCount={state?.data.users?.length ?? 0}
          onLeave={onLeave}
          onRename={onRename}
        />
        <VideoInput send={send} />
        <div className="flex items-center justify-end">
          {!isMobile && isChatCollapsed && (
            <button
              onClick={onExpandChat}
              className="flex cursor-pointer items-center justify-center rounded-xl p-2 text-sm font-semibold text-background transition hover:bg-primary-surface-1 duration-200"
            >
              <ArrowLeftFromLine />
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 p-6">
        <div className="relative h-full overflow-hidden rounded-2xl border border-line bg-primary-surface-0 shadow-2xl">
          {state?.type === "STATE" && state.data.videoUrl ? (
            <Player
              ref={playerRef}
              url={state.data.videoUrl}
              onStateChange={onPlayerStateChange}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
              <p className="text-lg font-medium text-background/70">
                Nothing is in the queue
              </p>
              <p className="mt-1 text-sm text-background/40">
                Add a video to the queue to start watching together.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
