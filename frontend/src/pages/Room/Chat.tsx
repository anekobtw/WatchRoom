import { useRef, useState, useEffect } from "react";
import { Send } from "lucide-react";
import { ChatBubble } from "./ChatBubble";

type ChatMessage = {
  type: "CHAT";
  text: string;
  ts?: number;
};

type Props = {
  send: (msg: ChatMessage) => void;
  messages: ChatMessage[];
};

export function Chat({ send, messages }: Props) {
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const sendMsg = () => {
    const value = text.trim();
    if (!value) return;

    send({
      type: "CHAT",
      text: value,
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

        {messages.map((m, i) => (
          <ChatBubble key={i} message={m} previous={messages[i - 1]} />
        ))}
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
