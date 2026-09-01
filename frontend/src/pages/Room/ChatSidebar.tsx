import { useState, useEffect, useRef } from "react";
import { Users, ArrowRightFromLine, ArrowDown, ArrowUp } from "lucide-react";
import { useRoomContext } from "./RoomContext";
import Chat from "./components/Chat";

export default function ChatSidebar({
  isCollapsed,
  isMobile,
  onToggleCollapse,
  hasUnread,
}: {
  isCollapsed: boolean;
  isMobile: boolean;
  onToggleCollapse: () => void;
  hasUnread: boolean;
}) {
  const { room, userId } = useRoomContext();
  const users = Array.from(room.state?.data?.users ?? []);
  const messages = room.state?.data?.messages ?? [];
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
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showUsers]);


  const collapseIcon = isMobile ? (
    isCollapsed ? (
      <ArrowUp className="text-background" />
    ) : (
      <ArrowDown className="text-background" />
    )
  ) : (
    <ArrowRightFromLine className="text-background" size={24} />
  );

  if (isCollapsed && !isMobile) {
    return null;
  }

  return (
    <aside className="flex h-full flex-col border-l border-line bg-primary-surface-0 font-mulish">
      <div className="w-full flex flex-row items-center justify-between border-b border-line px-4 py-4 text-md font-semibold text-background">
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={isCollapsed ? "Expand chat" : "Collapse chat"}
          className="relative hover:bg-primary-surface-1 cursor-pointer rounded-xl p-2 transition duration-200"
        >
          {collapseIcon}
          {isCollapsed && hasUnread && (
            <span className="absolute left-0 top-0 h-2.5 w-2.5 rounded-full bg-red-500" />
          )}
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
            <div
              className={`absolute right-0 z-20 w-56 overflow-hidden rounded-2xl border border-line bg-primary-surface-0 shadow-xl ${
                isMobile ? "bottom-full mb-2" : "top-12"
              }`}
            >
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
          <Chat send={room.send} messages={messages} userId={userId} />
        </div>
      )}
    </aside>
  );
}
