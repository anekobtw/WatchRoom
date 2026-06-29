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

    if (!password.trim() && !isPublic) {
      setShowPublicDialog(true);
      return;
    }

    createRoom();
  }

  return (
    <>
      <div className="flex min-h-screen bg-[#0b0f19] font-inter text-white">
        <div className="hidden md:block md:w-1/2 lg:w-7/12 relative">
          <img
            src="/nasa.jpg"
            alt="Space background"
            loading="eager"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-r from-transparent to-[#0b0f19]/30" />
        </div>

        <div className="w-full md:w-1/2 lg:w-5/12 flex flex-col justify-center px-8 sm:px-16 lg:px-24">
          <div className="w-full max-w-md mx-auto">
            <h1 className="text-4xl font-bold tracking-tight">Create Room</h1>
            <p className="mt-3 text-gray-400">
              Welcome! Please configure your watch room settings below.
            </p>

            <form onSubmit={handleSubmit} className="mt-10 space-y-6">
              <div className="relative">
                <label className="absolute -top-2.5 left-3 bg-[#0b0f19] px-1 text-xs text-gray-400">
                  Room Name
                </label>
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => {
                    setRoomName(e.target.value);
                    if (e.target.value.trim()) setRoomNameError(false);
                  }}
                  placeholder="Movie Night"
                  className={`w-full rounded-lg border bg-transparent px-4 py-3.5 text-sm outline-none transition ${
                    roomNameError
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-700 focus:border-blue-500"
                  }`}
                />
                {roomNameError && (
                  <p className="mt-1.5 text-xs text-red-500">
                    Room name cannot be empty
                  </p>
                )}
              </div>

              <div className="relative">
                <label className="absolute -top-2.5 left-3 bg-[#0b0f19] px-1 text-xs text-gray-400">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Leave empty for a passwordless room"
                  className="w-full rounded-lg border border-gray-700 bg-transparent px-4 py-3.5 text-sm outline-none focus:border-blue-500 transition"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-700 bg-transparent text-blue-500 focus:ring-0 cursor-pointer accent-blue-500"
                  />
                  <label
                    htmlFor="isPublic"
                    className="text-sm text-gray-300 cursor-pointer select-none"
                  >
                    Public Room
                  </label>
                </div>

                <div className="group relative">
                  <button
                    type="button"
                    className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-800 text-xs text-gray-400 hover:bg-blue-600 hover:text-white transition"
                  >
                    ?
                  </button>
                  <div className="pointer-events-none absolute bottom-full right-0 mb-2 w-64 rounded-lg bg-gray-800 p-3 text-xs text-gray-300 opacity-0 transition group-hover:opacity-100 shadow-xl border border-gray-700">
                    Public rooms appear on the main page. Private rooms are only
                    accessible via direct link.
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full cursor-pointer rounded-lg bg-primary py-3.5 font-semibold text-white hover:bg-primary-hover transition-colors shadow-lg"
              >
                Create Room
              </button>
            </form>

            <div className="mt-8 text-center text-sm text-gray-500">
              Want to join an existing room?{" "}
              <span className="text-primary hover:underline cursor-pointer">
                Browse rooms
              </span>
            </div>
          </div>
        </div>
      </div>

      {showPublicDialog && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm p-6 z-50">
          <div className="w-full max-w-sm rounded-xl border border-gray-800 bg-[#0b0f19] p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white">Public Room</h2>
            <p className="mt-3 text-sm text-gray-400">
              This room has no password and will be accessible by anyone.
              Continue?
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowPublicDialog(false)}
                className="flex-1 cursor-pointer rounded-lg border border-gray-700 py-2.5 text-sm font-medium text-gray-300 hover:bg-gray-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowPublicDialog(false);
                  createRoom();
                }}
                className="flex-1 cursor-pointer rounded-lg bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary-hover transition"
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
