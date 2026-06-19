import { useParams } from "react-router-dom";
import { useRoomWS } from "./useRoomWS";
import { useEffect, useState } from "react";

type RoomState = {
  type: "STATE";
  roomId: string;
  videoUrl: string | null;
  videoTimestamp: number;
  playing: boolean;
};

export default function Room() {
  const { id } = useParams();
  const wsRef = useRoomWS(id);

  const [videoUrl, setVideoUrl] = useState("");
  const [timestamp, setTimestamp] = useState(0);
  const [playing, setPlaying] = useState(false);

  const sendState = (next?: Partial<RoomState>) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN || !id) return;

    ws.send(
      JSON.stringify({
        type: "SET_STATE",
        roomId: id,
        videoUrl: videoUrl || null,
        videoTimestamp: timestamp,
        playing,
        ...next,
      }),
    );
  };

  useEffect(() => {
    const ws = wsRef.current;
    if (!ws) return;

    ws.onmessage = (e) => {
      const data: RoomState = JSON.parse(e.data);

      if (data.type !== "STATE") return;
      if (data.roomId !== id) return;

      if (data.videoUrl !== null) setVideoUrl(data.videoUrl);
      setTimestamp(data.videoTimestamp);
      setPlaying(data.playing);
    };
  }, [wsRef.current]);

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-xl mx-auto space-y-6">
        <div className="text-sm opacity-60">Room: {id}</div>

        <div className="space-y-2">
          <label className="text-sm">Video URL</label>
          <input
            className="w-full p-2 rounded bg-surface border border-line"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm">Timestamp</label>
          <input
            type="number"
            className="w-full p-2 rounded bg-surface border border-line"
            value={timestamp}
            onChange={(e) => setTimestamp(Number(e.target.value))}
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            className="px-4 py-2 rounded bg-primary hover:bg-primary-hover"
            onClick={() => {
              setPlaying(true);
              sendState({ playing: true });
            }}
          >
            Play
          </button>

          <button
            className="px-4 py-2 rounded bg-surface border border-line"
            onClick={() => {
              setPlaying(false);
              sendState({ playing: false });
            }}
          >
            Pause
          </button>

          <button
            className="px-4 py-2 rounded bg-surface border border-line"
            onClick={() => sendState()}
          >
            Sync
          </button>
        </div>

        <div className="text-xs opacity-60">
          Status: {playing ? "Playing" : "Paused"}
        </div>
      </div>
    </div>
  );
}
