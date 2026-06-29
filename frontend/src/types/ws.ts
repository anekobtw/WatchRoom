export type ClientToServer =
  | {
      type: "JOIN";
      data: {
        roomId: string;
        clientId: string;
        rawPassword: string;
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

export type ServerToClient =
  | {
      type: "STATE";
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
        ts: number;
        senderClientId: string;
      };
    }
  | {
      type: "USERS";
      data: {
        users: User[];
      };
    }
  | {
      type: "ERROR";
      data: {
        errorMessage: string;
      };
    };

export type ChatMessage = {
  text: string;
  ts: number;
  senderClientId: string;
};

export type User = {
  clientId: string;
  name: string;
  admin: boolean;
};
