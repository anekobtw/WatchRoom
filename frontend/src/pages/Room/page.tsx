import { useParams } from "react-router-dom";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Chat } from "./Chat";
import YouTubePlayer from "../../components/players/YouTubePlayer";
import { useRoomWS } from "./useRoomWS";
import { useRoomSync } from "./useRoomSync";

export default function Room() {
  const { id } = useParams();

  const { state, messages, send } = useRoomWS(id);

  const { playerRef, onPlayerStateChange } = useRoomSync({
    state,
    send,
  });

  const [chatOpen, setChatOpen] = useState(true);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-background text-foreground font-inter">
      <div className="flex flex-col flex-1 md:flex-3 min-w-0 p-4 md:p-6 gap-4">
        <p className="text-10 text-foreground/30">Room {id}</p>

        <div className="relative flex-1 bg-black rounded-2xl overflow-hidden">
          {state?.type === "STATE" && state.data.videoUrl ? (
            <YouTubePlayer
              ref={playerRef}
              videoId={state.data.videoUrl}
              onStateChange={onPlayerStateChange}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-foreground/40">
              Nothing queued
            </div>
          )}
        </div>
      </div>

      <div
        className={`md:flex-1 md:max-w-95 border-l border-line bg-surface flex flex-col ${
          chatOpen ? "h-[30vh]" : "h-14"
        } md:h-auto`}
      >
        <button
          onClick={() => setChatOpen((v) => !v)}
          className="px-4 py-4 border-b border-line flex justify-between"
        >
          Watching with
          <ChevronDown className="md:hidden" />
        </button>

        <Chat send={send} messages={messages} />
      </div>
    </div>
  );
}
