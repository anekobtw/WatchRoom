import { useRef, useState, useEffect } from "react";
import { Send, Users, ArrowRightFromLine } from "lucide-react";
import type { ChatMessage, ClientToServer } from "@/types/ws";
import { getConnectionToken } from "@/scripts/connectionToken";

function ChatBubble({
  message,
  isMine,
}: {
  message: ChatMessage;
  isMine: boolean;
}) {
  return (
    <div className={`flex w-full ${isMine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[70%] px-3 py-2 rounded-lg text-sm ${
          isMine ? "bg-primary-accent text-primary" : "bg-border text-black"
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
      data: {
        connectionToken: getConnectionToken() ?? "",
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
    <div className="flex flex-col h-full font-inter">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2.5"
      >
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center gap-1.5 text-center">
            <p className="text-md text-primary/35">No messages yet</p>
          </div>
        )}

        {messages.map((m, i) => (
          <ChatBubble
            key={i}
            message={m}
            isMine={true} // TODO: change this always true to an actual logic
          />
        ))}
      </div>

      <div className="border-t border-line p-3">
        <div className="flex items-center gap-2 rounded-full bg-surface-2 border border-border text-text-muted pl-4 pr-1.5 py-1.5">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMsg()}
            placeholder="Send a message"
            className="flex-1 bg-transparent text-sm outline-none"
          />

          <button onClick={sendMsg} disabled={!text.trim()} className="p-1">
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
    <aside className="flex h-full flex-col border-l border-line bg-surface-0">
      <div className="w-full flex flex-row items-center justify-between border-b border-border px-4 py-4 text-center text-md font-semibold text-text-primary">
        <button className="hover:bg-surface-2 rounded-xl cursor-pointer transition duration-200 p-2">
          <ArrowRightFromLine className="text-text-primary" size={24} />
        </button>
        Chat
        <button className="hover:bg-surface-2 rounded-xl cursor-pointer transition duration-200 p-2">
          <Users />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        <Chat send={send} messages={messages} />
      </div>
    </aside>
  );
}
