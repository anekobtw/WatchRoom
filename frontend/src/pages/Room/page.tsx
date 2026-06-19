import { useParams } from "react-router-dom";
import { useRoomWS } from "./useRoomWS";
import { useRef, useEffect, useState } from "react";
import { Chat } from "./Chat";
import { Settings } from "lucide-react";

export default function Room() {
  const { id } = useParams();
  const { state, send } = useRoomWS(id);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [url, setUrl] = useState("");
  const [urlOpen, setUrlOpen] = useState(false);

  useEffect(() => {
    if (!state || !videoRef.current) return;
    if (state.videoUrl && videoRef.current.src !== state.videoUrl) {
      videoRef.current.src = state.videoUrl;
    }
    if (typeof state.videoTimestamp === "number") {
      videoRef.current.currentTime = state.videoTimestamp;
    }
    if (state.playing) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  }, [state]);

  const update = (patch: any) => {
    send({ type: "SET_STATE", ...patch });
  };

  return (
    <div className="flex h-screen bg-background text-foreground font-inter">
      <div className="flex-[3] flex flex-col p-6 gap-4 min-w-0">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-10 text-foreground/40">Room {id}</p>
          </div>

          <button className="cursor-pointer h-8 w-8 flex items-center justify-center rounded-md hover:bg-surface-2">
            <Settings size={20} />
          </button>
        </div>

        <div className="relative flex-1 rounded-2xl overflow-hidden bg-black ring-1 ring-line shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6)]">
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-contain bg-black"
          />

          {!state?.videoUrl && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-foreground/35">
              <p className="font-title text-sm uppercase">Nothing queued</p>
              <p className="text-xs text-foreground/25">
                Type /queue {"{"}link{"}"} to the chat to
              </p>
            </div>
          )}

          <div className="absolute inset-x-3 bottom-3 rounded-xl bg-surface/80 backdrop-blur-md border border-line shadow-lg">
            <div className="flex items-center gap-3 px-3 py-2.5">
              <button
                onClick={() => update({ playing: !state?.playing })}
                className="cursor-pointer flex h-8 w-8 items-center justify-center rounded-full bg-primary hover:bg-primary-hover transition-colors shrink-0"
              >
                {state?.playing ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <rect x="1.5" y="1" width="3" height="10" fill="white" />
                    <rect x="7.5" y="1" width="3" height="10" fill="white" />
                  </svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M1.5 1L10.5 6L1.5 11V1Z" fill="white" />
                  </svg>
                )}
              </button>

              <button
                onClick={() =>
                  update({ videoTimestamp: videoRef.current?.currentTime ?? 0 })
                }
                className="cursor-pointer font-title text-[11px] uppercase text-foreground/60 hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-surface-2 shrink-0"
              >
                Sync time
              </button>

              <div className="flex-1" />

              <button
                onClick={() => setUrlOpen((v) => !v)}
                className="cursor-pointer font-title text-[11px] uppercase text-foreground/60 hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-surface-2 shrink-0"
              >
                {urlOpen ? "Close" : "Set video"}
              </button>
            </div>

            {urlOpen && (
              <div className="flex items-center gap-2 px-3 pb-3">
                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Paste a video URL"
                  className="flex-1 bg-surface-2 border border-line rounded-md px-3 py-1.5 text-sm placeholder:text-foreground/30 outline-none focus:ring-2 focus:ring-primary"
                  autoFocus
                />
                <button
                  onClick={() => {
                    update({ videoUrl: url });
                    setUrlOpen(false);
                  }}
                  className="cursor-pointer bg-primary hover:bg-primary-hover transition-colors text-sm rounded-md px-3 py-1.5 shrink-0"
                >
                  Load
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 min-w-[300px] max-w-[380px] flex flex-col border-l border-line bg-surface">
        <div className="px-4 py-4 border-b border-line">
          <p className="font-title text-[11px] uppercase text-foreground/40">
            Watching with
          </p>
        </div>
        <div className="flex-1 overflow-hidden">
          <Chat send={send} />
        </div>
      </div>
    </div>
  );
}
