import { useState } from "react";
import { ArrowLeftFromLine, Link2, LogOut, Pencil } from "lucide-react";

import Player from "@/components/Player";
import { useRoomContext } from "./RoomContext";

type Props = {
  isChatCollapsed: boolean;
  isMobile: boolean;
  onExpandChat: () => void;
};

export default function MainContent({
  isChatCollapsed,
  isMobile,
  onExpandChat,
}: Props) {
  const { room, roomId, leaveRoom, setUserName, userName } = useRoomContext();

  const [videoInput, setVideoInput] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(userName);

  const videoUrl =
    room.state?.type === "STATE" ? room.state.data.videoUrl : null;

  const userCount = room.state?.data.users?.length ?? 0;

  const submitName = () => {
    const trimmed = nameInput.trim();

    setEditingName(false);

    if (trimmed && trimmed !== userName) {
      setUserName(trimmed);
    } else {
      setNameInput(userName);
    }
  };

  const addVideo = () => {
    if (!videoInput.trim()) return;

    room.send({
      type: "UPDATE",
      data: {
        videoUrl: videoInput.trim(),
        videoTimestamp: 0,
        playing: false,
      },
    });

    setVideoInput("");
  };

  return (
    <main className="flex h-full min-w-0 flex-1 flex-col overflow-y-auto bg-primary font-mulish text-background">
      <div className="grid grid-cols-1 gap-4 px-6 py-5 lg:grid-cols-[auto_1fr_auto] lg:items-center">
        <div className="flex items-center gap-2">
          <button
            onClick={leaveRoom}
            className="cursor-pointer rounded-xl p-2 text-critical transition hover:bg-critical/20"
          >
            <LogOut />
          </button>

          <div>
            <h1 className="font-title text-xl font-semibold sm:text-2xl">
              Room {roomId}
            </h1>

            <div className="text-sm text-background/60">
              {userName && (
                <div className="flex items-center gap-1">
                  <span>Your name:</span>

                  {editingName ? (
                    <input
                      autoFocus
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      onBlur={submitName}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") submitName();
                        if (e.key === "Escape") {
                          setEditingName(false);
                          setNameInput(userName);
                        }
                      }}
                      className="rounded bg-primary-surface-1 px-1 outline-none"
                    />
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setNameInput(userName);
                          setEditingName(true);
                        }}
                        className="cursor-pointer text-background transition hover:text-background/90"
                      >
                        {userName}
                      </button>

                      <button
                        onClick={() => {
                          setNameInput(userName);
                          setEditingName(true);
                        }}
                        className="cursor-pointer rounded p-1 transition hover:bg-primary-surface-1"
                      >
                        <Pencil size={14} />
                      </button>
                    </>
                  )}
                </div>
              )}

              <p>{userCount} watching</p>
            </div>
          </div>
        </div>

        <div className="min-w-0 w-full max-w-xl justify-self-center">
          <div className="flex min-w-0 w-full items-center gap-2 rounded-xl border border-line bg-primary-surface-0 px-3 py-2">
            <Link2 size={16} className="shrink-0 text-background/60" />

            <input
              value={videoInput}
              onChange={(e) => setVideoInput(e.target.value)}
              placeholder="Paste video link..."
              className="min-w-0 flex-1 bg-transparent text-sm text-background/90 outline-none placeholder:text-background/40"
            />

            <button
              onClick={addVideo}
              className="shrink-0 cursor-pointer rounded-lg bg-background px-3 py-1 text-xs text-primary transition hover:bg-background/90"
            >
              Add
            </button>
          </div>
        </div>

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
