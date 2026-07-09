import { useRef, useState, useEffect } from "react";
import {
  Send,
  Users,
  ArrowRightFromLine,
  ArrowDown,
  ArrowUp,
} from "lucide-react";
import type { ChatMessage, ClientToServer } from "@/types/ws";
import { getConnectionId } from "@/scripts/connectionId";
import { getUserName } from "@/scripts/userName";

function ChatBubble({ message }: { message: ChatMessage }) {
  const isMe = message.senderName === getUserName();
  return (
    <div
      className={`flex w-full flex-col ${isMe ? "items-end" : "items-start"}`}
    >
      <span className="mb-1 text-xs font-medium text-background/70">
        {message.senderName}
      </span>
      <div
        className={`max-w-[70%] rounded-lg border border-line px-3 py-2 text-sm ${isMe ? "bg-background text-primary" : "bg-primary-surface-0 text-background"}`}
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
      data: { text: text.trim() },
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
    <div className="flex h-full flex-col bg-primary-surface-0 font-mulish text-background">
      <div
        ref={scrollRef}
        className="flex flex-1 flex-col gap-2.5 overflow-y-auto px-4 py-4"
      >
        {messages.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center gap-1.5 text-center">
            <p className="text-sm text-background/40">No messages yet</p>
          </div>
        )}
        {messages.map((m, idx) => (
          <ChatBubble key={idx} message={m} />
        ))}
      </div>
      <div className="border-t border-line p-3">
        <div className="flex items-center gap-2 rounded-full border border-line bg-primary-surface-0 pl-4 pr-1.5 py-1.5 text-background/70">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMsg()}
            placeholder="Send a message"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none text-background placeholder:text-background/40"
          />
          <button
            onClick={sendMsg}
            disabled={!text.trim()}
            className="shrink-0 p-1 text-background transition hover:text-background/80"
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
  users,
  messages,
  isCollapsed,
  isMobile,
  onToggleCollapse,
}: {
  send: (msg: ClientToServer) => void;
  users: string[];
  messages: ChatMessage[];
  isCollapsed: boolean;
  isMobile: boolean;
  onToggleCollapse: () => void;
  name: string;
}) {
  const [showUsers, setShowUsers] = useState(false);
  const usersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showUsers) return;

    const handleClick = (e: MouseEvent) => {
      if (!usersRef.current?.contains(e.target as Node)) {
        setShowUsers(false);
      }
    };

    document.addEventListener("mousedown", handleClick);

    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, [showUsers]);

  const collapseIcon = isMobile ? (
    isCollapsed ? (
      <ArrowDown className="text-background" />
    ) : (
      <ArrowUp className="text-background" />
    )
  ) : (
    <ArrowRightFromLine className="text-background" size={24} />
  );

  return (
    <aside className="flex h-full flex-col border-l border-line bg-primary-surface-0 font-mulish">
      <div className="w-full flex flex-row items-center justify-between border-b border-line px-4 py-4 text-md font-semibold text-background">
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={isCollapsed ? "Expand chat" : "Collapse chat"}
          className="hover:bg-primary-surface-1 cursor-pointer rounded-xl p-2 transition duration-200"
        >
          {collapseIcon}
        </button>

        <span>Chat</span>

        <div ref={usersRef} className="relative">
          <button
            onClick={() => setShowUsers((v) => !v)}
            className="hover:bg-primary-surface-1 cursor-pointer rounded-xl p-2 transition duration-200"
          >
            <Users className="text-background" />
          </button>

          {showUsers && (
            <div className="absolute right-0 top-12 z-20 w-56 overflow-hidden rounded-2xl border border-line bg-primary-surface-0 shadow-xl">
              <div className="border-b border-line px-4 py-3 text-sm font-semibold text-background">
                Users ({users.length})
              </div>

              <div className="max-h-72 overflow-y-auto py-2">
                {users.map((user) => (
                  <div
                    key={user}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-background transition hover:bg-primary-surface-1"
                  >
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span>{user}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {!isCollapsed && (
        <div className="min-h-0 flex-1 overflow-hidden">
          <Chat send={send} messages={messages} />
        </div>
      )}
    </aside>
  );
}
