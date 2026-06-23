export type ChatView = {
  text: string;
  ts: number;
  senderClientId: string;
};

export type RoomUpdateView = {
  videoUrl?: string;
  videoTimestamp?: number;
  playing?: boolean;
};

export type ErrorView = {
  errorMessage: string;
};

export type WsMessage =
  | { type: "CHAT"; data: ChatView }
  | { type: "STATE"; data: RoomUpdateView }
  | { type: "ERROR"; data: ErrorView };

export type OutgoingMessage =
  | {
      type: "JOIN";
      data: {
        roomId: string;
        clientId: string;
        rawPassword: string;
      };
    }
  | {
      type: "CHAT";
      data: {
        text: string;
      };
    }
  | {
      type: "UPDATE";
      data: {
        videoUrl?: string;
        videoTimestamp?: number;
        playing?: boolean;
      };
    };
