import { useParams } from "react-router-dom";
import { useRoomWS } from "./useRoomWS";
import { useRef, useEffect, useCallback } from "react";
import YouTube from "react-youtube";
import type { YouTubeEvent } from "react-youtube";
import { Chat } from "./Chat";
import { Settings } from "lucide-react";

const SYNC_THRESHOLD_SECONDS = 1;
const PERIODIC_SYNC_MS = 10_000;
const VIDEO_COMMAND_REGEX = /^\/video\s+(\S+)/i;
const YOUTUBE_ID_REGEX =
  /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/;

function extractYouTubeId(url?: string | null): string | null {
  if (!url) return null;
  const match = url.match(YOUTUBE_ID_REGEX);
  if (match) return match[1];
  return /^[\w-]{11}$/.test(url) ? url : null; // allow a bare ID too
}

export default function Room() {
  const { id } = useParams();
  const { state, send, messages } = useRoomWS(id);

  const playerRef = useRef<any>(null);
  const currentVideoId = useRef<string | null>(null);
  const ignoreEcho = useRef(false); // true while we're applying remote state to the player

  const videoId = extractYouTubeId(state?.videoUrl);

  // Apply server state to the player.
  useEffect(() => {
    const player = playerRef.current;
    if (!state || !player || !videoId) return;

    ignoreEcho.current = true;

    if (videoId !== currentVideoId.current) {
      currentVideoId.current = videoId;
      player.loadVideoById(videoId, state.videoTimestamp ?? 0);
    } else if (
      typeof state.videoTimestamp === "number" &&
      Math.abs(player.getCurrentTime() - state.videoTimestamp) >
        SYNC_THRESHOLD_SECONDS
    ) {
      player.seekTo(state.videoTimestamp, true);
    }

    if (state.playing) player.playVideo();
    else player.pauseVideo();

    // Give the player a moment to fire its own onStateChange for this
    // programmatic change before we start listening again — otherwise
    // we'd immediately echo our own update straight back to the server.
    const t = setTimeout(() => (ignoreEcho.current = false), 300);
    return () => clearTimeout(t);
  }, [state, videoId]);

  const reportPlaybackState = useCallback(
    (playing: boolean) => {
      const player = playerRef.current;
      if (!player) return;
      send({
        type: "SET_STATE",
        playing,
        videoTimestamp: player.getCurrentTime(),
      });
    },
    [send],
  );

  // This replaces the old manual play/pause/sync buttons — the player
  // itself is now the source of truth.
  const handlePlayerStateChange = (e: YouTubeEvent<number>) => {
    if (ignoreEcho.current) return;
    if (e.data === YouTube.PlayerState.PLAYING) reportPlaybackState(true);
    else if (e.data === YouTube.PlayerState.PAUSED) reportPlaybackState(false);
  };

  // Safety-net sync: YouTube's API doesn't fire an event for a seek made
  // while paused, so this catches that case (and general drift) too.
  useEffect(() => {
    const interval = setInterval(() => {
      if (!ignoreEcho.current) reportPlaybackState(!!state?.playing);
    }, PERIODIC_SYNC_MS);
    return () => clearInterval(interval);
  }, [reportPlaybackState, state?.playing]);

  // Intercept "/video {url}" before it ever becomes a chat message.
  const sendWithCommands = useCallback(
    (msg: any) => {
      if (msg.type === "CHAT" && typeof msg.text === "string") {
        const match = msg.text.trim().match(VIDEO_COMMAND_REGEX);
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

  return (
    <div className="flex h-screen bg-background text-foreground font-inter">
      <div className="flex-[3] flex flex-col p-6 gap-4 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-10 text-foreground/40">Room {id}</p>
          <button className="cursor-pointer h-8 w-8 flex items-center justify-center rounded-md hover:bg-surface-2">
            <Settings size={20} />
          </button>
        </div>

        <div className="relative flex-1 rounded-2xl overflow-hidden bg-black ring-1 ring-line shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6)]">
          {videoId ? (
            <YouTube
              videoId={videoId}
              opts={{
                width: "100%",
                height: "100%",
                playerVars: { rel: 0, modestbranding: 1 },
              }}
              className="absolute inset-0 h-full w-full"
              iframeClassName="h-full w-full"
              onReady={(e) => (playerRef.current = e.target)}
              onStateChange={handlePlayerStateChange}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-foreground/35">
              <p className="font-title text-sm uppercase">Nothing queued</p>
              <p className="text-xs text-foreground/25">
                Type /video {"{youtube link}"} in the chat
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 min-w-[300px] max-w-[380px] flex flex-col border-l border-line bg-surface">
        <div className="px-4 py-4 border-b border-line">
          <p className="font-title text-[11px] uppercase text-foreground/40">
            Watching with
          </p>
        </div>
        <div className="flex-1 overflow-hidden">
          <Chat send={sendWithCommands} messages={messages} />
        </div>
      </div>
    </div>
  );
}
