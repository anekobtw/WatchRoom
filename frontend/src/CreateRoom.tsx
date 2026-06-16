import { useEffect } from "react";
import { X } from "lucide-react";

export default function CreateRoom({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="w-full max-w-md p-4">
      <form className="bg-background border border-surface p-6 rounded-xl font-sans">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="text-white/50 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-xs text-foreground/50 mb-1">
            Your username
          </label>
          <input
            name="username"
            className="w-full p-3 rounded bg-black/30 border border-white/10"
            type="text"
          />
        </div>

        <button
          className="cursor-pointer w-full bg-primary hover:bg-primary/75 transition-all duration-200 p-3 rounded text-foreground"
          type="submit"
        >
          Create
        </button>
      </form>
    </div>
  );
}
