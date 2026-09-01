import type { PlayerAPI, PlayerStateChange } from "@/components/PlayerAPI";

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

export type ServerToClient = RoomStateMessage | RoomErrorMessage;

export type RoomStateMessage = {
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

export type RoomErrorMessage = {
  type: "ERROR";
  data: {
    code: "ROOM_NOT_FOUND";
  };
};

export type ChatMessage = {
  userId: string; // TODO: remove it and instead return ChatMessageView without exposing userId
  userName: string;
  text: string;
  ts: number;
};

export type RoomController = {
  state: RoomStateMessage | null;
  send: (msg: ClientToServer) => void;
  roomUnavailable?: boolean;
  setPlayer: (player: PlayerAPI | null) => void;
  onPlayerStateChange: (event: PlayerStateChange) => void;
};
