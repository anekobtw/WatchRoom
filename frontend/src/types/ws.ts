export type ClientToServer =
  | {
      type: "CONNECT";
      connectionId: string;
      data: {
        roomId: string;
        name: string;
      };
    }
  | {
      type: "UPDATE";
      connectionId: string;
      data: {
        videoUrl?: string;
        videoTimestamp?: number;
        playing?: boolean;
      };
    }
  | {
      type: "CHAT";
      connectionId: string;
      data: {
        text: string;
      };
    }
  | {
      type: "LEAVE";
      connectionId: string;
      data: null;
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
  senderName: string;
  text: string;
  ts: number;
};

export type User = {
  name: string;
  isAdmin: boolean;
};
