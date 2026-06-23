import { useRef, useState, useEffect } from "react";
import { Send } from "lucide-react";
import { ChatBubble } from "./ChatBubble";
import type { ChatMessage } from "../../types/ws";
import { getClientId } from "../../../scripts/getClientId";

type Props = {
  send: (msg: any) => void;
  messages: ChatMessage[];
};

export function Chat({ send, messages }: Props) {
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const clientId = useRef(getClientId());

  const sendMsg = () => {
    const value = text.trim();
    if (!value) return;

    send({
      type: "CHAT",
      data: {
        text: value,
      },
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
          </div>
        )}

        {messages.map((m, i) => (
          <ChatBubble
            key={i}
            message={m}
            isMine={m.senderClientId === clientId.current}
          />
        ))}
      </div>

      <div className="border-t border-line p-3">
        <div className="flex items-center gap-2 rounded-full bg-surface-2 border border-line pl-4 pr-1.5 py-1.5">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMsg()}
            placeholder="Send a message"
            className="flex-1 bg-transparent text-sm outline-none"
          />

          <button onClick={sendMsg} disabled={!text.trim()}>
            <Send size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
