import { useRef, useState, useEffect } from "react";
import { Send, Users, ArrowRightFromLine } from "lucide-react";
import type { ChatMessage, ClientToServer } from "@/types/ws";
import { getConnectionId } from "@/scripts/connectionId";

function ChatBubble({ message }: { message: ChatMessage }) {
  return (
    <div
      className={`flex w-full ${message.isMine ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[70%] px-3 py-2 rounded-lg text-sm border border-line ${
          message.isMine
            ? "bg-background text-primary"
            : "bg-primary-surface-0 text-background"
        }`}
      >
        {message.text}
      </div>
    </div>
  );
}

function Chat({
  send,
  messages,
}: {
  send: (msg: ClientToServer) => void;
  messages: ChatMessage[];
}) {
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const sendMsg = () => {
    if (!text.trim()) return;

    send({
      type: "CHAT",
      connectionId: getConnectionId() ?? "",
      data: {
        text: text.trim(),
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
    <div className="flex flex-col text-background bg-primary-surface-0 h-full font-mulish">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2.5"
      >
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center gap-1.5 text-center">
            <p className="text-sm text-background/40">No messages yet</p>
          </div>
        )}

        {messages.map((m, idx) => (
          <ChatBubble key={idx} message={m} />
        ))}
      </div>

      <div className="border-t border-line p-3">
        <div className="flex items-center gap-2 rounded-full bg-primary-surface-0 border border-line text-background/70 pl-4 pr-1.5 py-1.5">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMsg()}
            placeholder="Send a message"
            className="flex-1 bg-transparent text-sm outline-none text-background placeholder:text-background/40"
          />

          <button
            onClick={sendMsg}
            disabled={!text.trim()}
            className="p-1 text-background hover:text-background/80 transition"
          >
            <Send size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ChatSidebar({
  send,
  messages,
}: {
  send: (msg: ClientToServer) => void;
  messages: ChatMessage[];
}) {
  return (
    <aside className="flex h-full flex-col border-l border-line bg-primary-surface-0 font-mulish">
      <div className="w-full flex flex-row items-center justify-between border-b border-line px-4 py-4 text-md font-semibold text-background">
        <button className="hover:bg-primary-surface-1 rounded-xl cursor-pointer transition duration-200 p-2">
          <ArrowRightFromLine className="text-background" size={24} />
        </button>
        Chat
        <button className="hover:bg-primary-surface-1 rounded-xl cursor-pointer transition duration-200 p-2">
          <Users className="text-background" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        <Chat send={send} messages={messages} />
      </div>
    </aside>
  );
}
