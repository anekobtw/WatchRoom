export type ClientToServer =
  | {
      type: "CONNECT";
      data: {
        connectionToken: string;
        roomId: string;
        name: string;
      };
    }
  | {
      type: "UPDATE";
      data: {
        connectionToken: string;
        videoUrl?: string;
        videoTimestamp?: number;
        playing?: boolean;
      };
    }
  | {
      type: "CHAT";
      data: {
        connectionToken: string;
        text: string;
      };
    };

export type ServerToClient = {
  type: "STATE";
  data: {
    roomId: string;
    videoUrl: string;
    videoTimestamp: number;
    playing: boolean;
    users?: Array<User>;
    messages?: Array<ChatMessage>;
  };
};

export type ChatMessage = {
  senderClientId: string;
  text: string;
  ts: number;
};

export type User = {
  name: string;
  isAdmin: boolean;
};
