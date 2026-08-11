import type { RefObject } from "react";
import type { PlayerAPI } from "@/components/PlayerAPI";

export type ClientToServer =
  | {
      type: "CONNECT";
      data: {
        roomId: string;
        userId: string;
        userName?: string;
      };
    }
  | {
      type: "UPDATE";
      data: {
        videoUrl?: string;
        videoTimestamp?: number;
        playing?: boolean;
      };
    }
  | {
      type: "CHAT";
      data: {
        text: string;
      };
    }
  | {
      type: "LEAVE";
    };

export type ServerToClient = {
  type: "STATE";
  data: {
    version: number;
    updatedBy: string;
    videoUrl: string;
    videoTimestamp: number;
    playing: boolean;
    users?: string[];
    messages?: Array<ChatMessage>;
  };
};

export type ChatMessage = {
  userId: string; // TODO: remove it and instead return ChatMessageView without exposing userId
  userName: string;
  text: string;
  ts: number;
};

export type RoomController = {
  state: ServerToClient | null;
  send: (msg: ClientToServer) => void;
  roomUnavailable?: boolean;
  playerRef: RefObject<PlayerAPI | null>;
  onPlayerStateChange: (event: { data: number }) => void;
};
