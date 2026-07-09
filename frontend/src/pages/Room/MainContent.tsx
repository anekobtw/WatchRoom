import { useEffect, useRef, useState, type RefObject } from "react";
import { Link2, ArrowLeftFromLine, LogOut, Pencil } from "lucide-react";
import Player from "@/components/Player";
import type { PlayerAPI } from "@/types/player";
import type { ServerToClient, User, ClientToServer } from "@/types/ws";
import { getConnectionId } from "@/scripts/connectionId";

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
  currentName: string | null;
  isChatCollapsed: boolean;
  isMobile: boolean;
  onExpandChat: () => void;
  onRename: (name: string) => void;
  send: (msg: ClientToServer) => void;
};

export default function MainContent({
  roomId,
  users,
  state,
  playerRef,
  onPlayerStateChange,
  onLeave,
  currentName,
  isChatCollapsed,
  isMobile,
  onExpandChat,
  onRename,
  send,
}: MainContentProps) {
  const [openQueue, setOpenQueue] = useState(false);
  const [input, setInput] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(currentName ?? "");
  const loadedUrlRef = useRef<string | null>(null);

  useEffect(() => {
    setNameInput(currentName ?? "");
  }, [currentName]);

  useEffect(() => {
    if (!playerRef.current || !state?.data.videoUrl) return;
    if (loadedUrlRef.current === state.data.videoUrl) return;
    loadedUrlRef.current = state.data.videoUrl;
    playerRef.current.load(state.data.videoUrl, state.data.videoTimestamp);
  }, [state?.data.videoUrl, playerRef]);

  useEffect(() => {
    if (!playerRef.current || !state?.data) return;

    if (state.data.playing) {
      playerRef.current.play();
    } else {
      playerRef.current.pause();
    }
  }, [state?.data.playing, playerRef]);

  useEffect(() => {
    if (!playerRef.current || state?.data.videoTimestamp == null) return;

    let cancelled = false;

    (async () => {
      const currentTime = await playerRef.current!.getTime();
      if (cancelled) return;

      const drift = Math.abs(currentTime - state.data.videoTimestamp);
      if (drift > 2) {
        playerRef.current!.seek(state.data.videoTimestamp);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [state?.data.videoTimestamp, playerRef]);

  const submitName = () => {
    const trimmed = nameInput.trim();
    setEditingName(false);
    if (trimmed && trimmed !== currentName) {
      onRename(trimmed);
    } else {
      setNameInput(currentName ?? "");
    }
  };

  return (
    <main className="flex h-full min-w-0 flex-1 flex-col bg-primary font-mulish text-background">
      <div className="grid grid-cols-1 gap-4 px-6 py-5 lg:grid-cols-[auto_1fr_auto] lg:items-center">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <button
              onClick={onLeave}
              className="text-critical hover:bg-critical/20 duration-200 transition cursor-pointer p-2 rounded-xl"
            >
              <LogOut />
            </button>
            <div>
              <h1 className="font-title text-xl font-semibold sm:text-2xl">
                Room {roomId}
              </h1>
              <div className="text-sm text-background/60">
                {currentName && (
                  <div className="flex items-center gap-1">
                    <span>Your name:</span>
                    {editingName ? (
                      <input
                        autoFocus
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        onBlur={submitName}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            submitName();
                          }
                          if (e.key === "Escape") {
                            setEditingName(false);
                            setNameInput(currentName ?? "");
                          }
                        }}
                        className="rounded bg-primary-surface-1 px-1 outline-none"
                      />
                    ) : (
                      <>
                        <button
                          onClick={() => setEditingName(true)}
                          className="cursor-pointer text-background transition hover:text-background/90"
                        >
                          {currentName}
                        </button>
                        <button
                          onClick={() => setEditingName(true)}
                          className="cursor-pointer rounded p-1 transition hover:bg-primary-surface-1"
                        >
                          <Pencil size={14} />
                        </button>
                      </>
                    )}
                  </div>
                )}
                {state ? (
                  <p>{users?.length ?? 0} watching</p>
                ) : (
                  <p>Connecting...</p>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="relative min-w-0 w-full max-w-xl justify-self-center">
          <div className="flex min-w-0 w-full items-center gap-2 rounded-xl border border-line bg-primary-surface-0 px-3 py-2">
            <Link2 size={16} className="shrink-0 text-background/60" />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={() => setOpenQueue(true)}
              placeholder="Paste video link..."
              className="min-w-0 flex-1 bg-transparent text-sm outline-none text-background/90 placeholder:text-background/40"
            />
            <button
              onClick={() => {
                if (!input) return;
                send({
                  type: "UPDATE",
                  connectionId: getConnectionId(),
                  data: { videoUrl: input, videoTimestamp: 0, playing: false },
                });
                setInput("");
              }}
              className="shrink-0 cursor-pointer rounded-lg bg-background px-3 py-1 text-xs text-primary transition duration-200 hover:bg-background/90"
            >
              Add
            </button>
          </div>
        </div>
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
