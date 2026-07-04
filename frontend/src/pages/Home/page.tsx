import { ChevronRight } from "lucide-react";

export default function WatchtogethermParty() {
  return (
    <div className="min-h-screen bg-background text-primary font-mulish">
      {/* Hero Section */}
      <section className="min-h-[90vh] flex items-center px-6 py-20 lg:py-45">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-title font-bold leading-tight mb-6">
              Watching alone is optional. <br />
              Stay in sync, even when you are apart.
            </h1>

            <p className="text-lg text-primary/60 mb-12 leading-relaxed max-w-md">
              Pick a film, send the link, and end up in the same front row.
            </p>

            <div className="flex flex-wrap gap-2">
              <button className="bg-primary hover:bg-primary-hover text-background px-6 py-3 rounded-lg font-semibold text-sm inline-flex items-center gap-2 transition hover:shadow-lg hover:-translate-y-0.5 duration-200 cursor-pointer">
                Create a room
                <ChevronRight size={18} />
              </button>

              <button className="bg-primary hover:bg-primary-hover text-background px-6 py-3 rounded-lg font-semibold text-sm inline-flex items-center gap-2 transition hover:shadow-lg hover:-translate-y-0.5 duration-200 cursor-pointer">
                Join a room
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="font-title">
            <h2 className="text-3xl md:text-4xl lg:text-6xl italic border-l-4 border-l-accent pl-6 pb-2 leading-tight">
              "Movie nights used to feel like this."
            </h2>

            <p className="text-lg md:text-xl lg:text-2xl pl-6 mt-3">
              <span className="text-accent">@thegeneralist01</span>, 2026
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-primary text-background py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <h3 className="text-xl font-title font-bold mb-3">No signup</h3>
              <p className="text-background/60">
                Start watching in seconds. No accounts, no subscriptions, no
                fuss.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-title font-bold mb-3">
                Synchronized
              </h3>
              <p className="text-background/60">
                Everyone stays in sync automatically. Pause together, talk
                together.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-title font-bold mb-3">Any content</h3>
              <p className="text-background/60">
                YouTube, Netflix, your screen—bring whatever you want to watch.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="bg-background text-primary py-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-title font-bold mb-6">
            Ready to gather?
          </h2>
          <p className="text-lg text-primary/60 mb-8">
            Create a room and send the link. That's all there is to it.
          </p>
          <button className="bg-primary hover:bg-primary-hover text-background cursor-pointer px-8 py-4 rounded-lg font-semibold text-lg inline-flex items-center gap-2 transition hover:shadow-lg hover:-translate-y-0.5 duration-200">
            Create a room now
            <ChevronRight size={20} />
          </button>
        </div>
      </section>
    </div>
  );
}
