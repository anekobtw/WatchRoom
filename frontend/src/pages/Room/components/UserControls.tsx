import { useState } from "react";
import { LogOut, Pencil } from "lucide-react";
import { getUserName } from "@/scripts/userName";

type UserControlsProps = {
  roomId?: string;
  userCount: number;
  onLeave: () => void;
  onRename: (name: string) => void;
};

export default function UserControls({
  roomId,
  userCount,
  onLeave,
  onRename,
}: UserControlsProps) {
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(getUserName() ?? "");

  const submitName = () => {
    const trimmed = nameInput.trim();
    setEditingName(false);
    if (trimmed && trimmed !== getUserName()) onRename(trimmed);
    else setNameInput(getUserName() ?? "");
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onLeave}
        className="text-critical hover:bg-critical/20 duration-200 transition cursor-pointer p-2 rounded-xl"
      >
        <LogOut />
      </button>
      <div>
        <h1 className="font-title text-xl font-semibold sm:text-2xl">
          Room {roomId}
        </h1>
        <div className="text-sm text-background/60">
          {getUserName() && (
            <div className="flex items-center gap-1">
              <span>Your name:</span>
              {editingName ? (
                <input
                  autoFocus
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onBlur={submitName}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") submitName();
                    if (e.key === "Escape") {
                      setEditingName(false);
                      setNameInput(getUserName() ?? "");
                    }
                  }}
                  className="rounded bg-primary-surface-1 px-1 outline-none"
                />
              ) : (
                <>
                  <button
                    onClick={() => {
                      setNameInput(getUserName() ?? "");
                      setEditingName(true);
                    }}
                    className="cursor-pointer text-background transition hover:text-background/90"
                  >
                    {getUserName()}
                  </button>
                  <button
                    onClick={() => {
                      setNameInput(getUserName() ?? "");
                      setEditingName(true);
                    }}
                    className="cursor-pointer rounded p-1 transition hover:bg-primary-surface-1"
                  >
                    <Pencil size={14} />
                  </button>
                </>
              )}
            </div>
          )}
          <p>{userCount} watching</p>
        </div>
      </div>
    </div>
  );
}
