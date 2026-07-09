import { useCallback, useEffect, useRef, useState } from "react";
import type { PlayerAPI } from "@/components/PlayerAPI";
import type { ClientToServer, ServerToClient } from "@/types/ws";
import { getConnectionId } from "@/scripts/connectionId";
import { getUserName } from "@/scripts/userName";

const SYNC_THRESHOLD_SECONDS = 1;

export function useRoom(roomId?: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const receivedStateRef = useRef(false);
  const playerRef = useRef<PlayerAPI | null>(null);
  const lastVideoRef = useRef<string | null>(null);

  // Track if we're currently syncing from server to prevent echo
  const isSyncingRef = useRef(false);
  // Track last sent state to prevent duplicate sends
  const lastSentStateRef = useRef<{ videoTimestamp: number; playing: boolean } | null>(null);

  const [state, setState] = useState<ServerToClient | null>(null);
  const [roomUnavailable, setRoomUnavailable] = useState(false);

  useEffect(() => {
    if (!roomId || !getUserName()) return;

    let disposed = false;
    receivedStateRef.current = false;
    setState(null);
    setRoomUnavailable(false);

    const ws = new WebSocket(import.meta.env.VITE_WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      const join: ClientToServer = {
        type: "CONNECT",
        connectionId: getConnectionId() ?? "",
        data: { roomId, name: getUserName() ?? "" },
      };
      ws.send(JSON.stringify(join));
    };

    ws.onmessage = (e) => {
      if (disposed) return;
      const msg = JSON.parse(e.data) as ServerToClient;
      if (msg.type === "STATE") {
        receivedStateRef.current = true;
        setRoomUnavailable(false);
        setState(msg);
      }
    };

    ws.onerror = () => {
      if (!disposed && !receivedStateRef.current) setRoomUnavailable(true);
    };

    ws.onclose = () => {
      wsRef.current = null;
      if (!disposed && !receivedStateRef.current) setRoomUnavailable(true);
    };

    return () => {
      disposed = true;
      ws.close();
      wsRef.current = null;
    };
  }, [roomId, !!getUserName()]);

  const send = useCallback((msg: ClientToServer) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify(msg));
  }, []);

  // Sync player with server state
  useEffect(() => {
    const sync = async () => {
      const player = playerRef.current;
      if (!player || !state || state.type !== "STATE" || !state.data.videoUrl)
        return;

      try {
        isSyncingRef.current = true;

        const { videoUrl, videoTimestamp = 0, playing } = state.data;
        const isNewVideo = lastVideoRef.current !== videoUrl;

        if (isNewVideo) {
          lastVideoRef.current = videoUrl;
          await player.load(videoUrl, videoTimestamp);
        } else {
          const currentTime = await player.getTime();
          if (Math.abs(currentTime - videoTimestamp) > SYNC_THRESHOLD_SECONDS) {
            await player.seek(videoTimestamp);
          }
        }

        playing ? await player.play() : await player.pause();

        // Update last sent state to match server state (prevents echo)
        lastSentStateRef.current = {
          videoTimestamp,
          playing,
        };
      } finally {
        isSyncingRef.current = false;
      }
    };

    sync();
  }, [state]);

  const onPlayerStateChange = useCallback(
    async ({ data }: { data: number }) => {
      // Ignore player events while we're syncing from server
      if (isSyncingRef.current) return;

      const player = playerRef.current;
      if (!player) return;

      // data === 0: ended, 1: playing, 2: paused, 3: buffering
      if (data === 3) {
        // Ignore buffering events
        return;
      }

      if (data !== 1 && data !== 2) return;

      // Get current state
      const currentTime = await player.getTime();
      const isPlaying = data === 1;

      // Check if this is actually a change from last sent state
      if (
        lastSentStateRef.current &&
        Math.abs(lastSentStateRef.current.videoTimestamp - currentTime) < 0.1 &&
        lastSentStateRef.current.playing === isPlaying
      ) {
        // No actual change, don't send
        return;
      }

      // Send update only for play/pause changes from user
      send({
        type: "UPDATE",
        connectionId: getConnectionId() ?? "",
        data: {
          videoTimestamp: currentTime,
          playing: isPlaying,
        },
      });

      // Update last sent state
      lastSentStateRef.current = {
        videoTimestamp: currentTime,
        playing: isPlaying,
      };
    },
    [send]
  );

  return {
    state,
    send,
    roomUnavailable,
    playerRef,
    onPlayerStateChange,
  };
}
