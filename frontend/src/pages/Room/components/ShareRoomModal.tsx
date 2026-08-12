import { useEffect, useState } from "react";
import { useRoomContext } from "../RoomContext";
import { Copy, X } from "lucide-react";
import QRCode from "qrcode";

export function ShareRoomModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { roomId } = useRoomContext();
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const roomUrl = `${window.location.origin}/room/${roomId}`;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && roomId) {
      QRCode.toDataURL(roomUrl, {
        width: 256,
        margin: 0,
        color: {
          dark: "#d9cfc7",
          light: "#2b2623",
        },
      }).then(setQrCodeUrl);
    }
  }, [isOpen, roomId]);
  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(roomUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  const socialLinks = [
    {
      name: "WhatsApp",
      icon: "https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg",
      url: `https://wa.me/?text=${encodeURIComponent("Join my room on WatchRoom! " + roomUrl)}`,
    },
    {
      name: "Telegram",
      icon: "https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg",
      url: `https://t.me/share/url?url=${encodeURIComponent(roomUrl)}&text=${encodeURIComponent("Join my room on WatchRoom!")}`,
    },
    {
      name: "Twitter",
      icon: "https://upload.wikimedia.org/wikipedia/commons/c/ce/X_logo_2023.svg",
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(roomUrl)}&text=${encodeURIComponent("Join my room on WatchRoom!")}`,
    },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary/60 backdrop-blur-sm">
      <div 
        className="absolute inset-0 cursor-pointer" 
        onClick={onClose}
      />
      <div 
        className="relative bg-primary-surface-0 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 text-background"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-surface-0 transition-colors text-background/60 hover:text-background cursor-pointer"
        >
          <X size={20} />
        </button>

        <div className="p-8 flex flex-col items-center text-center">
          <h2 className="font-title text-3xl font-bold text-background mb-2">Share Room</h2>
          <p className="text-background/60 text-sm mb-8">Invite your friends to watch together!</p>

          <div className="relative p-0 bg-background rounded-none overflow-hidden shadow-inner mb-8">
            {qrCodeUrl && (
              <img 
                src={qrCodeUrl} 
                alt="Room QR Code" 
                className="w-48 h-48"
              />
            )}
          </div>

          <div className="w-full flex items-center gap-2 p-2 bg-primary-surface-1 rounded-2xl border border-line mb-8">
            <span className="flex-1 text-sm text-background/80 truncate px-2 font-medium">
              {roomUrl}
            </span>
            <button 
              onClick={copyToClipboard}
              className="p-2 bg-surface-0 text-primary rounded-xl hover:bg-surface-1 transition-colors cursor-pointer w-10 h-10 flex items-center justify-center shrink-0"
            >
              {copied ? <span className="text-green-500 font-bold">✔</span> : <Copy size={16} />}
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {socialLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-primary-surface-1 border border-line rounded-full text-xs font-semibold text-background hover:bg-primary-surface-0 transition-all active:scale-95 cursor-pointer"
              >
                <img src={link.icon} alt={link.name} className="w-4 h-4" />
                {link.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
