import { useEffect, useState } from "react";

const steps = [
  "Create a room",
  "Add your video to the queue",
  "Invite your friends",
  "Enjoy",
];

export function Tooltip({ open }: { open: boolean }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const isMobile = window.matchMedia("(pointer: coarse)").matches;

  useEffect(() => {
    if (!open || isMobile) return;

    const move = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [open, isMobile]);

  if (!open) return null;

  return (
    <div
      className="fixed z-50 w-72"
      style={
        isMobile
          ? {
              bottom: 100,
              left: "50%",
              transform: "translateX(-50%)",
            }
          : {
              top: pos.y + 12,
              left: pos.x + 12,
            }
      }
    >
      <div className="rounded-xl bg-zinc-900/95 border border-white/10 p-5 text-sm text-white/80 shadow-lg space-y-3">
        {steps.map((text, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="flex size-7 items-center justify-center rounded-full bg-white/10 border border-white/20 text-white text-xs shrink-0">
              {i + 1}
            </div>
            {text}
          </div>
        ))}
      </div>
    </div>
  );
}
