import { useRef, useState, useEffect } from "react";
import { Send } from "lucide-react";

export function Chat({
  send,
  messages,
}: {
  send: (msg: any) => void;
  messages: any[];
}) {
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const sendMsg = () => {
    if (!text.trim()) return;

    send({
      type: "CHAT",
      text,
      ts: Date.now(),
    });

    setText("");
  };

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const formatTime = (ts?: number) =>
    ts
      ? new Date(ts).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

  return (
    <div className="flex flex-col h-full font-inter">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2.5"
      >
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center gap-1.5 text-center">
            <p className="font-title text-xs uppercase text-foreground/35">
              No messages yet
            </p>
            <p className="text-xs text-foreground/25 max-w-[180px]">
              Say something while you wait for the video to load
            </p>
          </div>
        )}

        {messages.map((m, i) => {
          const prev = messages[i - 1];
          const showTime =
            !prev || (m.ts && prev.ts && m.ts - prev.ts > 5 * 60 * 1000);

          return (
            <div key={i} className="flex flex-col items-end gap-1">
              {showTime && m.ts && (
                <span className="text-[11px] text-foreground/30 px-1">
                  {formatTime(m.ts)}
                </span>
              )}

              <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-primary px-3 py-2 text-sm leading-snug break-words">
                {m.text}
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-line p-3">
        <div className="flex items-center gap-2 rounded-full bg-surface-2 border border-line pl-4 pr-1.5 py-1.5 focus-within:ring-2 focus-within:ring-primary">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMsg()}
            placeholder="Send a message"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-foreground/30"
          />

          <button
            onClick={sendMsg}
            disabled={!text.trim()}
            aria-label="Send"
            className="cursor-pointer flex h-7 w-7 items-center justify-center rounded-full bg-primary hover:bg-primary-hover disabled:bg-surface disabled:opacity-40 transition-colors shrink-0"
          >
            <Send size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
