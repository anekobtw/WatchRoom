import { useState } from "react";
import { useNavigate } from "react-router-dom";

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export default function CreateRoom() {
  const [roomName, setRoomName] = useState("");
  const [password, setPassword] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [showPublicDialog, setShowPublicDialog] = useState(false);
  const [roomNameError, setRoomNameError] = useState(false);

  const navigate = useNavigate();

  function createRoom() {
    const slug = slugify(roomName);

    console.log({
      roomName,
      password: password || null,
      public: isPublic,
      slug,
    });

    navigate(`/room/${slug}`);
  }

  function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();

    if (!roomName.trim()) {
      setRoomNameError(true);
      return;
    }

    setRoomNameError(false);

    if (!password.trim()) {
      setShowPublicDialog(true);
      return;
    }

    createRoom();
  }
 
  return (
    <>
      <div className="relative min-h-screen overflow-hidden bg-background font-inter text-foreground">
        {/* BACKGROUND IMAGE */}
        <div className="absolute inset-0">
          <img
            src="/earth_picture.jpg"
            aria-hidden="true"
            loading="eager"
            className="fade-image h-full w-full object-cover blur-[1.5px]"
          />

          <div className="absolute inset-0 bg-background/80" />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />
          <div className="absolute inset-0 bg-linear-to-b from-background/40 to-transparent" />
        </div>

        {/* CONTENT */}
        <div className="flex fade-2 min-h-screen flex-col items-center justify-center px-6">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md rounded-2xl border border-line bg-surface p-8 shadow-2xl backdrop-blur-xl"
          >
            <h1 className="text-3xl font-bold font-title">Create Room</h1>

            <p className="mt-2 text-sm text-foreground/60">
              Create a private or public watch room.
            </p>

            <div className="mt-8 space-y-5">
              <div>
                <label className="mb-2 block text-sm">Room Name</label>

                <input
                  value={roomName}
                  onChange={(e) => {
                    setRoomName(e.target.value);
                    if (e.target.value.trim()) setRoomNameError(false);
                  }}
                  placeholder="Movie Night"
                  className={`w-full rounded-xl border bg-surface-2 px-4 py-3 outline-none transition ${
                    roomNameError
                      ? "border-critical focus:border-critical"
                      : "border-line focus:border-primary"
                  }`}
                />

                {roomNameError && (
                  <p className="mt-2 text-xs text-critical">
                    Room name cannot be empty
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm">Password</label>

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Leave empty for a passwordless room."
                  className="w-full rounded-xl border border-line bg-surface-2 px-4 py-3 outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="h-4 w-4 accent-primary cursor-pointer"
                />

                <label className="cursor-pointer">Public Room</label>

                <div className="group relative">
                  <button
                    type="button"
                    className="cursor-pointer flex h-5 w-5 items-center justify-center rounded-full bg-surface-2 text-xs text-foreground/60 hover:bg-primary hover:text-white transition"
                  >
                    ?
                  </button>

                  <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 w-64 -translate-x-1/2 rounded-lg bg-surface-2 p-3 text-xs text-foreground/70 opacity-0 transition group-hover:opacity-100">
                    Public rooms appear on the main page. Private rooms are only
                    accessible via link.
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="duration-200 cursor-pointer mt-8 w-full rounded-xl bg-primary py-3 font-medium text-white hover:bg-primary-hover transition"
            >
              Create Room
            </button>
          </form>
        </div>
      </div>

      {/* MODAL */}
      {showPublicDialog && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
          <div className="w-full max-w-sm rounded-2xl border border-line bg-surface p-6">
            <h2 className="text-xl font-bold">Public Room</h2>

            <p className="mt-3 text-sm text-foreground/60">
              This room will be accessible by anyone with the link. Continue?
            </p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowPublicDialog(false)}
                className="duration-200 cursor-pointer flex-1 rounded-xl border border-line py-3 hover:bg-surface-2"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  setShowPublicDialog(false);
                  createRoom();
                }}
                className="duration-200 cursor-pointer flex-1 rounded-xl bg-primary text-white py-3 hover:bg-primary-hover"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
