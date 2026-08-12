import { useRoomContext } from "../RoomContext";
import type { ConnectionStatus } from "@/websocket/useRoom";

export function ConnectionBadge() {
  const { room } = useRoomContext();
  const { status, reconnect } = room;

  const statusConfig: Record<ConnectionStatus, { color: string; label: string; dot: string }> = {
    connected: { 
      color: "text-green-400", 
      label: "Connected", 
      dot: "bg-green-400" 
    },
    reconnecting: { 
      color: "text-yellow-400", 
      label: "Reconnecting", 
      dot: "bg-yellow-400 animate-pulse" 
    },
    disconnected: { 
      color: "text-red-400", 
      label: "Disconnected", 
      dot: "bg-red-400" 
    },
  };

  const { color, label, dot } = statusConfig[status as ConnectionStatus];

  return (
    <div className="flex items-center gap-3 px-2 py-1 rounded-full bg-primary-surface-0/50 backdrop-blur-sm border border-line text-xs font-medium transition-all duration-300">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${dot}`} />
        <span className={color}>{label}</span>
      </div>
      
      {status === "disconnected" && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            reconnect();
          }}
          className="ml-1 px-2 py-0.5 bg-accent text-background rounded-full hover:bg-opacity-90 transition-all duration-200 cursor-pointer font-bold uppercase tracking-wider text-[10px]"
        >
          Reconnect
        </button>
      )}
    </div>
  );
}
