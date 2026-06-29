import { useParams } from "react-router-dom";
import { PlaySquare, Settings, Share2 } from "lucide-react";
import { Chat } from "./Chat";
import YouTubePlayer from "../../components/players/YouTubePlayer";
import { useRoomSync } from "./useRoomSync";
import { useRoomWS } from "./useRoomWS";

export default function Room() {
  const { id } = useParams();

  const { state, messages, users, send } = useRoomWS(id);
  const { playerRef, onPlayerStateChange } = useRoomSync({
    state,
    send,
  });

  const buttonClass =
    "flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-surface-2 px-4 py-2 text-sm transition duration-200 hover:bg-primary";

  return (
    <div className="fade-1 flex h-screen overflow-hidden bg-background font-inter text-foreground">
      {/* LEFT SIDEBAR */}
      <aside className="flex w-64 flex-col border-r border-line bg-surface">
        <div className="flex-1 overflow-y-auto p-5">
          <div className="mb-5 text-xs font-semibold uppercase tracking-wider text-foreground/80">
            Currently Watching{" "}
            <span className="font-normal text-foreground/40">
              {users?.length ?? 0} VIEWERS
            </span>
          </div>

          <div className="space-y-3">
            {users?.map((user) => (
              <div key={user.clientId} className="flex items-center gap-3">
                <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                  {user.name?.[0]?.toUpperCase()}

                  {user.admin && (
                    <span className="absolute -top-1 -right-1 text-[10px]">
                      👑
                    </span>
                  )}

                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-surface bg-green-500" />
                </div>

                <span className="text-sm text-foreground/80">{user.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4">
          <button className={`${buttonClass} w-full`}>
            <Share2 size={18} />
            Share
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-line px-6 py-5">
          <div>
            <h1 className="font-title text-2xl">Room {id}</h1>
          </div>

          <div className="flex items-center gap-3">
            <button className={buttonClass}>
              <Settings size={16} />
              Config
            </button>

            <button className={buttonClass}>
              <Settings size={16} />
              Room Settings
            </button>

            <div className="rounded-xl border border-line bg-surface px-4 py-2 text-sm text-foreground/50">
              PASSWORD: ***
            </div>
          </div>
        </header>

        <div className="border-b border-line px-6 py-4">
          <button className={buttonClass}>
            <PlaySquare size={16} />
            Add Media / Browse Queue
          </button>
        </div>

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
                <PlaySquare size={44} className="mb-4 text-foreground/25" />

                <p className="text-lg font-medium text-foreground/70">
                  Nothing is in the queue
                </p>

                <p className="mt-1 text-sm text-foreground/40">
                  Add a video to the queue to start watching together.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* CHAT */}
      <aside className="flex w-80 flex-col border-l border-line bg-surface">
        <div className="border-b border-line px-4 py-4 text-center text-sm font-semibold uppercase tracking-wider text-foreground/60">
          Chat
        </div>

        <div className="relative flex-1 overflow-hidden">
          <Chat send={send} messages={messages} />
        </div>
      </aside>
    </div>
  );
}
