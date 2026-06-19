export type PlayerAPI = {
  load: (url: string, timestamp?: number) => void;
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
  getTime: () => number;
  getDuration?: () => number;
};
