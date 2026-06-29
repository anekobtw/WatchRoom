import { useState } from "react";

export default function CreateRoom() {
  const [roomName, setRoomName] = useState("");
  const [password, setPassword] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [showPublicDialog, setShowPublicDialog] = useState(false);
  const [roomNameError, setRoomNameError] = useState(false);

  function handleSubmit(e: React.FormEvent) {
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

  function createRoom() {
    console.log({
      roomName,
      password: password || null,
      public: isPublic,
    });
  }

  return (
    <>
      <div className="flex min-h-screen items-center justify-center bg-background px-6 font-inter">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md rounded-2xl border border-line bg-surface p-8 shadow-2xl"
        >
          <h1 className="font-bold text-3xl text-foreground">Create Room</h1>

          <p className="mt-2 text-sm text-gray-400">
            Create a private or public watch room.
          </p>

          <div className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Room Name
              </label>

              <input
                value={roomName}
                onChange={(e) => {
                  setRoomName(e.target.value);

                  if (e.target.value.trim()) {
                    setRoomNameError(false);
                  }
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
                  Room name cannot be empty.
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Password</label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave empty for a passwordless room"
                className="w-full rounded-xl border border-line bg-surface-2 px-4 py-3 outline-none transition focus:border-primary"
              />
            </div>

            <div className="flex items-center justify-between rounded-xl">
              <div className="flex items-center gap-3">
                <input
                  id="public-room"
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="h-4 w-4 accent-primary cursor-pointer"
                />

                <label
                  htmlFor="public-room"
                  className="cursor-pointer font-medium"
                >
                  Public Room
                </label>

                <div className="group relative">
                  <button
                    type="button"
                    className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-700 text-xs text-gray-300 transition hover:bg-primary hover:text-white"
                  >
                    ?
                  </button>

                  <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-64 -translate-x-1/2 rounded-lg bg-gray-700 px-3 py-2 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                    Public rooms are shown on the homepage so anyone can
                    discover them. Private rooms are hidden and can only be
                    joined using their direct link.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="mt-8 w-full cursor-pointer rounded-xl bg-primary py-3 font-medium transition hover:bg-primary-hover"
          >
            Create Room
          </button>
        </form>
      </div>

      {showPublicDialog && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-line bg-surface p-6">
            <h2 className="font-bold text-2xl">Passwordless Room</h2>

            <p className="mt-3 text-sm text-gray-300">
              This room will be created without a password. Anyone with the room
              link will be able to join. Are you sure?
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowPublicDialog(false)}
                className="flex-1 cursor-pointer rounded-xl border border-line py-3 duration-200 transition hover:bg-surface-2"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowPublicDialog(false);
                  createRoom();
                }}
                className="flex-1 cursor-pointer rounded-xl bg-primary py-3 transition duration-200 hover:bg-primary-hover"
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
