import { ChevronRight, Loader2 } from "lucide-react";
import { createRoom, ensureUserId } from "@/api/rooms";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Home() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function handleCreateRoom() {
    if (loading) return;
    setError(false);
    setLoading(true);

    try {
      const userId = await ensureUserId();
      const roomId = await createRoom(userId);

      navigate(`/room/${roomId}`);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-background text-primary font-mulish">
      {/* Hero Section */}
      <section className="w-full px-6 py-20 lg:py-45">
        <div className="max-w-8xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 py-12 mx-auto px-4 md:px-12 items-center">
          <div>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-title font-bold leading-tight mb-6">
              Watching alone is optional.
              <br />
              Bring everyone to WatchRoom.
            </h1>

            <p className="text-lg text-primary/60 mb-12 leading-relaxed max-w-md">
              Pick a movie, send the link, and watch together. No account
              required.
            </p>

            <div className="flex gap-2 w-full">
              <button
                className="flex-1 bg-primary hover:bg-primary-hover text-background px-4 py-3 rounded-lg font-semibold text-sm inline-flex items-center justify-center gap-2 transition disabled:opacity-60 cursor-pointer duration-200"
                onClick={handleCreateRoom}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    Create a room
                    <ChevronRight size={18} />
                  </>
                )}
              </button>

              <button
                className="flex-1 bg-primary hover:bg-primary-hover text-background px-4 py-3 rounded-lg font-semibold text-sm inline-flex items-center justify-center gap-2 transition cursor-pointer duration-200"
                onClick={() => navigate("/join-room")}
              >
                Join a room
                <ChevronRight size={18} />
              </button>
            </div>

            {error && (
              <p role="alert" className="mt-4 text-sm text-red-600">
                Unable to prepare your session. Please try again.
              </p>
            )}
          </div>

          <div className="font-title grid gap-16">
            <div>
              <h2 className="text-3xl md:text-4xl lg:text-6xl italic border-l-4 border-l-accent pl-6 pb-2 leading-tight">
                "Movie nights finally feel cozy again."
              </h2>

              <p className="text-lg md:text-xl lg:text-2xl pl-6 mt-3">
                <a
                  href="https://x.com/thegeneralist01/"
                  target="_blank"
                  rel="noreferrer"
                  className="cursor-pointer text-accent underline underline-offset-4 hover:text-accent/80"
                >
                  @thegeneralist01
                </a>
                , 2026
              </p>
            </div>

            <div>
              <h2 className="text-3xl md:text-4xl lg:text-6xl italic border-l-4 border-l-accent pl-6 pb-2 leading-tight">
                "There is no way it's actually free and so convinient."
              </h2>

              <p className="text-lg md:text-xl lg:text-2xl pl-6 mt-3">
                <a
                  href="https://www.behance.net/zverskly"
                  target="_blank"
                  rel="noreferrer"
                  className="cursor-pointer text-accent underline underline-offset-4 hover:text-accent/80"
                >
                  @zverskly
                </a>
                , 2026
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-primary text-background py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <h3 className="text-xl font-title font-bold mb-3">
                No signup needed
              </h3>
              <p className="text-background/60">
                You can start watching in literally seconds. No accounts, no
                ads, no subscriptions.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-title font-bold mb-3">
                Synchronized
              </h3>
              <p className="text-background/60">
                Video is being played the same for everyone in the room.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-title font-bold mb-3">Any content</h3>
              <p className="text-background/60">
                YouTube and SoundCloud are supported.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
