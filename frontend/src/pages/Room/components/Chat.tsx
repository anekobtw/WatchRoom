import { useRef, useState, useEffect } from "react";
import { Send } from "lucide-react";
import type { ChatMessage, ClientToServer } from "@/websocket/types";

function ChatBubble({
  message,
  userId,
}: {
  message: ChatMessage;
  userId: string;
}) {
  const isMe = message.userId === userId;

  return (
    <div className={`flex w-full flex-col ${isMe ? "items-end" : "items-start"}`}>
      <span className="mb-1 text-xs font-medium text-background/70">
        {message.userName}
      </span>

      <div
        className={`max-w-[70%] rounded-lg border border-line px-3 py-2 text-sm ${
          isMe
            ? "bg-background text-primary"
            : "bg-primary-surface-0 text-background"
        }`}
      >
        {message.text}
      </div>
    </div>
  );
}

export default function Chat({
  send,
  messages,
  userId,
}: {
  send: (msg: ClientToServer) => void;
  messages: ChatMessage[];
  userId: string;
}) {
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const sendMsg = () => {
    if (!text.trim()) return;

    send({
      type: "CHAT",
      data: {
        text: text.trim(),
      },
    });

    setText("");
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex h-full flex-col bg-primary-surface-0 font-mulish text-background">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.map((msg, i) => (
          <ChatBubble key={i} message={msg} userId={userId} />
        ))}
      </div>

      <form
        className="flex items-center gap-2 border-t border-line p-4"
        onSubmit={(e) => {
          e.preventDefault();
          sendMsg();
        }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Message..."
          className="flex-1 rounded-lg bg-primary-surface-1 px-3 py-2 text-sm outline-none text-background/90 placeholder:text-background/40"
        />
        <button
          type="submit"
          className="rounded-lg bg-background p-2 text-primary transition hover:bg-background/90"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
