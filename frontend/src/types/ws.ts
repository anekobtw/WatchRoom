export type ClientToServer =
  | {
      type: "CONNECT";
      data: {
        joinToken: string;
        name: string;
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
  clientId: string;
  name: string;
  roomId: string;
};
