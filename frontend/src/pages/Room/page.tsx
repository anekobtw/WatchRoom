import { useParams } from "react-router-dom";
import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown } from "lucide-react";
import { Chat } from "./Chat";
import type { PlayerAPI } from "../../types/player";
import { useRoomWS } from "./useWS";
import YouTubePlayer from "../../components/players/YouTubePlayer";

const SYNC_THRESHOLD_SECONDS = 1;

export default function Room() {
  const { id } = useParams();
  const { state, messages, send } = useRoomWS(id);

  const playerRef = useRef<PlayerAPI | null>(null);
  const ignoreEcho = useRef(false);
  const lastVideoRef = useRef<string | null>(null);

  const [chatOpen, setChatOpen] = useState(true);

  useEffect(() => {
    const player = playerRef.current;
    if (!state?.videoUrl || !player) return;

    const isNewVideo = lastVideoRef.current !== state.videoUrl;
    ignoreEcho.current = true;

    if (isNewVideo) {
      lastVideoRef.current = state.videoUrl;
      player.load(state.videoUrl, state.videoTimestamp ?? 0);
    } else {
      const currentTime = player.getTime();

      if (
        typeof state.videoTimestamp === "number" &&
        Math.abs(currentTime - state.videoTimestamp) > SYNC_THRESHOLD_SECONDS
      ) {
        player.seek(state.videoTimestamp);
      }
    }

    if (state.playing) player.play();
    else player.pause();

    const t = setTimeout(() => {
      ignoreEcho.current = false;
    }, 250);

    return () => clearTimeout(t);
  }, [state]);

  const handleCommand = useCallback(
    (msg: any) => {
      if (msg.type === "CHAT" && typeof msg.text === "string") {
        const match = msg.text.trim().match(/^\/video\s+(\S+)/i);

        if (match) {
          send({
            type: "SET_STATE",
            videoUrl: match[1],
            videoTimestamp: 0,
            playing: true,
          });
          return;
        }
      }

      send(msg);
    },
    [send],
  );

  const handlePlayerStateChange = useCallback(
    (e: any) => {
      if (ignoreEcho.current || !playerRef.current) return;

      const player = playerRef.current;

      if (e.data === 1) {
        send({
          type: "SET_STATE",
          playing: true,
          videoTimestamp: player.getTime(),
        });
      }

      if (e.data === 2) {
        send({
          type: "SET_STATE",
          playing: false,
          videoTimestamp: player.getTime(),
        });
      }
    },
    [send],
  );

  return (
    <div className="flex flex-col md:flex-row h-screen bg-background text-foreground font-inter">
      <div className="flex flex-col flex-1 md:flex-[3] min-w-0 p-4 md:p-6 gap-4">
        <p className="text-10 text-foreground/40">Room {id}</p>

        <div className="relative flex-1 bg-black rounded-2xl overflow-hidden">
          {state?.videoUrl ? (
            <YouTubePlayer
              ref={playerRef}
              videoId={state.videoUrl}
              onStateChange={handlePlayerStateChange}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-foreground/40">
              Nothing queued
            </div>
          )}
        </div>
      </div>

      <div
        className={`md:flex-1 md:max-w-[380px] border-l border-line bg-surface flex flex-col ${
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

        <Chat send={handleCommand} messages={messages} />
      </div>
    </div>
  );
}
