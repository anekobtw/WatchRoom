type ChatMessage = {
  text: string;
  ts?: number;
};

function formatTime(ts?: number) {
  if (!ts) return "";

  return new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ChatBubble({
  message,
  previous,
}: {
  message: ChatMessage;
  previous?: ChatMessage;
}) {
  const showTime =
    !previous ||
    (message.ts && previous.ts && message.ts - previous.ts > 5 * 60 * 1000);

  return (
    <div className="flex flex-col items-end gap-1">
      {showTime && message.ts && (
        <span className="text-[11px] text-foreground/30 px-1">
          {formatTime(message.ts)}
        </span>
      )}

      <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-primary px-3 py-2 text-sm leading-snug break-words">
        {message.text}
      </div>
    </div>
  );
}
