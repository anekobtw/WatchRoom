import { useState } from "react";
import { Link2 } from "lucide-react";
import { getConnectionId } from "@/scripts/connectionId";
import type { ClientToServer } from "@/types/ws";

type VideoInputProps = {
  send: (msg: ClientToServer) => void;
};

export default function VideoInput({ send }: VideoInputProps) {
  const [input, setInput] = useState("");

  return (
    <div className="min-w-0 w-full max-w-xl justify-self-center">
      <div className="flex min-w-0 w-full items-center gap-2 rounded-xl border border-line bg-primary-surface-0 px-3 py-2">
        <Link2 size={16} className="shrink-0 text-background/60" />
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste video link..."
          className="min-w-0 flex-1 bg-transparent text-sm outline-none text-background/90 placeholder:text-background/40"
        />
        <button
          onClick={() => {
            if (!input) return;

            send({
              type: "UPDATE",
              connectionId: getConnectionId(),
              data: { videoUrl: input, videoTimestamp: 0, playing: false },
            });

            setInput("");
          }}
          className="shrink-0 cursor-pointer rounded-lg bg-background px-3 py-1 text-xs text-primary transition duration-200 hover:bg-background/90"
        >
          Add
        </button>
      </div>
    </div>
  );
}
