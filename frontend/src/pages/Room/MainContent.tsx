import { useState, type RefObject } from "react";
import { LogOut, Settings, Link2 } from "lucide-react";

import YouTubePlayer from "@/components/players/YouTubePlayer";
import type { PlayerAPI } from "@/types/player";
import type { ServerToClient, User } from "@/types/ws";

type PlayerStateChangeEvent = {
  data: number;
};

type MainContentProps = {
  roomId?: string;
  users?: User[];
  state: ServerToClient | null;
  playerRef: RefObject<PlayerAPI | null>;
  onPlayerStateChange: (event: PlayerStateChangeEvent) => void;
  onLeave: () => void;
};

export default function MainContent({
  roomId,
  users,
  state,
  playerRef,
  onPlayerStateChange,
  onLeave,
}: MainContentProps) {
  const [openQueue, setOpenQueue] = useState(false);
  const [input, setInput] = useState("");

  return (
    <main className="flex h-full min-w-0 flex-1 flex-col bg-primary font-mulish text-background">
      <div className="flex items-center justify-between px-6 py-5">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={onLeave}
            aria-label="Leave room"
            className="hover:bg-critical/40 rounded-xl cursor-pointer p-2 transition duration-200"
          >
            <LogOut size={18} className="text-critical" />
          </button>

          <div>
            <h1 className="font-title text-2xl font-semibold">Room {roomId}</h1>
            <h3 className="text-background/60">{users?.length ?? 0} watching</h3>
          </div>
        </div>

        <div className="relative ml-6 max-w-xl flex-1">
          <div className="flex w-full items-center gap-2 rounded-xl border border-line bg-primary-surface-0 px-3 py-2">
            <Link2 size={16} className="text-background/60" />

            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={() => setOpenQueue(true)}
              placeholder="Paste video link..."
              className="flex-1 bg-transparent text-sm outline-none text-background/90 placeholder:text-background/40"
            />

            <button
              onClick={() => {
                if (!input) return;
                setInput("");
              }}
              className="cursor-pointer rounded-lg bg-background px-3 py-1 text-xs text-primary transition duration-200 hover:bg-background/90"
            >
              Add
            </button>
          </div>
        </div>

        <button className="ml-3 flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-background px-4 py-2 text-sm font-semibold text-primary transition duration-200 hover:bg-background/90">
          <Settings size={16} />
          Room Settings
        </button>
      </div>

      {openQueue && (
        <div className="absolute left-0 top-full z-50 mt-2 w-full rounded-xl border border-line bg-primary-surface-0 shadow-xl">
          <div className="p-3 text-sm font-medium text-background/70">
            Queue
          </div>

          <div className="max-h-64 overflow-auto px-3 pb-3 text-sm text-background/60">
            No items yet
          </div>
        </div>
      )}

      <div className="flex-1 p-6">
        <div className="relative h-full overflow-hidden rounded-2xl border border-line bg-primary-surface-0 shadow-2xl">
          {state?.type === "STATE" && state.data.videoUrl ? (
            <YouTubePlayer
              ref={playerRef}
              videoId={state.data.videoUrl}
              onStateChange={onPlayerStateChange}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
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
