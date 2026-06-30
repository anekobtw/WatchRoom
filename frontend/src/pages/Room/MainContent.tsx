import YouTubePlayer from "@/components/players/YouTubePlayer";
import type { ServerToClient, User } from "@/types/ws";
import type { PlayerAPI } from "@/types/player";
import { useState } from "react";
import { Settings, Link2 } from "lucide-react";

type MainContentProps = {
  roomId?: string;
  users?: User[];
  state: ServerToClient | null;
  playerRef: React.RefObject<PlayerAPI | null>;
  onPlayerStateChange: (event: any) => void;
};

export default function MainContent({
  roomId,
  users,
  state,
  playerRef,
  onPlayerStateChange,
}: MainContentProps) {
  const [openQueue, setOpenQueue] = useState(false);
  const [input, setInput] = useState("");

  return (
    <main className="flex h-full min-w-0 flex-1 flex-col">
      <div className="flex items-center justify-between px-6 py-5">
        <div>
          <h1 className="font-title text-text-primary text-2xl">
            Room {roomId}
          </h1>
          <h3 className="text-text-secondary/60">
            {users?.length ?? 0} watching
          </h3>
        </div>

        <div className="relative flex-1 max-w-xl ml-6">
          <div className="flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-2 w-full">
            <Link2 size={16} className="text-text-primary/50" />

            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={() => setOpenQueue(true)}
              placeholder="Paste video link..."
              className="flex-1 bg-transparent text-sm outline-none text-text-primary/80 placeholder:text-foreground/40"
            />

            <button
              onClick={() => {
                if (!input) return;
                setInput("");
              }}
              className="rounded-lg text-text-primary bg-primary hover:bg-primary-hover transition duration-200 px-3 py-1 text-xs cursor-pointer"
            >
              Add
            </button>
          </div>
        </div>

        <button className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-hover px-4 py-2 text-sm transition duration-200 ml-3 text-text-primary">
          <Settings size={16} />
          Room Settings
        </button>
      </div>

      {openQueue && (
        <div className="absolute left-0 top-full mt-2 w-full rounded-xl border border-border bg-surface-2 shadow-xl z-50">
          <div className="p-3 text-sm font-medium text-foreground/70">
            Queue
          </div>

          <div className="max-h-64 overflow-auto px-3 pb-3 text-sm text-foreground/60">
            No items yet
          </div>
        </div>
      )}

      <div className="flex-1 p-6">
        <div className="relative h-full overflow-hidden rounded-2xl border border-line bg-black shadow-2xl">
          {state?.type === "STATE" && state.data.videoUrl ? (
            <YouTubePlayer
              ref={playerRef}
              videoId={state.data.videoUrl}
              onStateChange={onPlayerStateChange}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-lg font-medium text-text-primary/70">
                Nothing is in the queue
              </p>

              <p className="mt-1 text-sm text-text-secondary/40">
                Add a video to the queue to start watching together.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
