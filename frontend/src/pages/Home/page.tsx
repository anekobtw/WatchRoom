import { ChevronRight, Loader2 } from "lucide-react";
import { setUserId, getUserId } from "@/scripts/userId";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Home() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  async function handleCreateRoom() {
    if (loading) return;
    setLoading(true);

    try {
      let userId = getUserId();

      if (!userId) {
        const userResponse = await fetch(
          import.meta.env.VITE_HTTP_URL + "/api/users/create",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          },
        );

        userId = await userResponse.text();
        setUserId(userId);
      }

      const roomResponse = await fetch(
        import.meta.env.VITE_HTTP_URL + "/api/rooms/create",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        },
      );

      const roomId = await roomResponse.text();

      navigate(`/room/${roomId}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-background text-primary font-mulish">
      {/* Hero Section */}
      <section className="w-full flex items-center px-6 py-20 lg:py-45">
        <div className="max-w-8xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 py-12 mx-4 md:mx-12 items-center">
          <div>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-title font-bold leading-tight mb-6">
              Watching alone is optional. <br />
              Stay in sync, even when you are apart.
            </h1>

            <p className="text-lg text-primary/60 mb-12 leading-relaxed max-w-md">
              Pick a movie, send the link, and watch together.
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
          </div>

          <div className="font-title grid gap-16">
            <div>
              <h2 className="text-3xl md:text-4xl lg:text-6xl italic border-l-4 border-l-accent pl-6 pb-2 leading-tight">
                "Movie nights finally feel cozy again."
              </h2>

              <p className="text-lg md:text-xl lg:text-2xl pl-6 mt-3">
                <span className="text-accent">@thegeneralist01</span>, 2026
              </p>
            </div>

            <div>
              <h2 className="text-3xl md:text-4xl lg:text-6xl italic border-l-4 border-l-accent pl-6 pb-2 leading-tight">
                "There is no way it's actually free and so convinient."
              </h2>

              <p className="text-lg md:text-xl lg:text-2xl pl-6 mt-3">
                <span className="text-accent">@zverskly</span>, 2026
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
                YouTube, something, something, etc. is supported
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
