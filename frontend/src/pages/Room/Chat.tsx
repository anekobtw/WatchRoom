import { useRef, useState, useEffect } from "react";
import { Send } from "lucide-react";
import { ChatBubble } from "./ChatBubble";
import type { WsMessage, OutgoingMessage } from "../../types/ws";

type Props = {
  send: (msg: OutgoingMessage) => void;
  messages: WsMessage[];
};

export function Chat({ send, messages }: Props) {
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const sendMsg = () => {
    const value = text.trim();
    if (!value) return;

    const msg: OutgoingMessage = {
      type: "CHAT",
      data: {
        text: value,
      },
    };

    send(msg);
    setText("");
  };

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const chatMessages = messages
    .filter((m): m is Extract<WsMessage, { type: "CHAT" }> => m.type === "CHAT")
    .map((m) => m.data);

  return (
    <div className="flex flex-col h-full font-inter">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2.5"
      >
        {chatMessages.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-xs text-foreground/35">
            No messages yet
          </div>
        )}

        {chatMessages.map((m, i) => (
          <ChatBubble key={i} message={m} previous={chatMessages[i - 1]} />
        ))}
      </div>

      <div className="border-t border-line p-3">
        <div className="flex items-center gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMsg()}
            placeholder="Send a message"
            className="flex-1 bg-transparent outline-none"
          />

          <button onClick={sendMsg} disabled={!text.trim()}>
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
