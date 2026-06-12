import "./index.css";
import Navbar from "./Navbar";

export default function App() {
  return (
    <div
      className="min-h-screen bg-background text-text overflow-x-hidden overflow-y-hidden"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Nav */}
      <Navbar />

      {/* Hero */}
      <section className="pt-40 pb-24 px-12 text-center">
        <h1 className="font-syne font-extrabold text-[clamp(2.8rem,6vw,5rem)] leading-[1.05] tracking-[-0.03em] mb-6 max-w-3xl mx-auto">
          Watch together,
          <br />
          <span className="text-primary">wherever you are</span>
        </h1>
        <p className="text-[1.05rem] text-white/40 max-w-md mx-auto leading-relaxed mb-10">
          Sync your player with friends and chat in real-time{" "}
          <b>Completely for free.</b>
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <a
            href="#"
            className="bg-primary hover:bg-primary-hover text-text text-sm font-medium px-6 py-3 rounded-lg transition-all hover:-translate-y-0.5"
          >
            Start a room
          </a>
          <a
            href="#"
            className="bg-transparent hover:bg-white/5 border border-white/15 hover:border-white/30 text-text text-sm font-medium px-6 py-3 rounded-lg transition-all hover:-translate-y-0.5"
          >
            See how it works
          </a>
        </div>
      </section>

      {/* Mockup */}
      <div className="relative max-w-3xl mx-auto px-12 mb-24">
        <div className="bg-[#1a2235] border border-white/[0.08] rounded-2xl overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,0.5)]">
          {/* Browser bar */}
          <div className="bg-[#0e1520] px-4 py-3 flex items-center gap-3 border-b border-white/[0.06]">
            <div className="w-[10px] h-[10px] rounded-full bg-critical" />
            <div className="w-[10px] h-[10px] rounded-full bg-[#f5a623]" />
            <div className="w-[10px] h-[10px] rounded-full bg-[#27ae60]" />
            <div className="flex-1 bg-[#1e2a40] rounded-md px-3 py-1 text-[0.68rem] text-white/25">
              shareview.app/room/friday-night
            </div>
          </div>
          {/* Body */}
          <div className="grid grid-cols-[3fr_1fr] h-[320px]">
            {/* Screen */}
            <div className="relative bg-[#0d1117] flex items-center justify-center overflow-hidden">
              <div className="scan-lines absolute inset-0 pointer-events-none" />
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center z-10 shadow-[0_0_32px_rgba(64,89,173,0.5)]">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M5 3.5L14.5 9 5 14.5V3.5Z" fill="white" />
                </svg>
              </div>
            </div>
            {/* Chat */}
            <div className="bg-[#141e2e] border-l border-white/[0.06] flex flex-col">
              <div className="px-3 py-3 text-[0.65rem] font-semibold tracking-[0.1em] uppercase text-white/25 border-b border-white/[0.06]">
                Chat
              </div>
              <div className="flex-1 p-3 flex flex-col gap-3 overflow-hidden">
                <div className="flex flex-col gap-1">
                  <span className="text-[0.58rem] text-white/25">maya</span>
                  <div className="bg-[#1e2c42] rounded-lg px-3 py-2 text-[0.65rem] text-white/50 leading-snug">
                    omg this part 😭
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[0.58rem] text-white/25">you</span>
                  <div className="bg-[#2a3a6a] rounded-lg px-3 py-2 text-[0.65rem] text-white/60 leading-snug">
                    I KNOW wait for it
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[0.58rem] text-white/25">maya</span>
                  <div className="bg-[#1e2c42] rounded-lg px-3 py-2 text-[0.65rem] text-white/50 leading-snug">
                    pause!! I need a snack
                  </div>
                </div>
              </div>
              <div className="p-2 border-t border-white/[0.06]">
                <div className="bg-[#1e2a40] rounded-md h-7 px-3 flex items-center text-[0.62rem] text-white/20">
                  Message...
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-5xl mx-auto px-12 pb-20 flex items-center gap-10 border-t border-white/[0.05] pt-16">
        {[
          ["2.4M", "Watch sessions hosted"],
          ["180ms", "Average sync latency"],
          ["140+", "Countries represented"],
        ].map(([n, l], i) => (
          <>
            <div key={i} className="flex-1 text-center">
              <div className="font-syne font-extrabold text-[2.4rem] tracking-[-0.03em]">
                {n}
              </div>
              <div className="text-[0.8rem] text-white/25 mt-1">{l}</div>
            </div>
            {i < 2 && <div className="w-px self-stretch bg-white/[0.05]" />}
          </>
        ))}
      </div>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-12 mb-20">
        <div className="bg-primary/10 border border-primary/20 rounded-3xl px-12 py-20 text-center">
          <h2 className="font-syne font-extrabold text-[clamp(1.8rem,3.5vw,2.8rem)] tracking-[-0.03em] mb-4">
            Your next movie night
            <br />
            starts here
          </h2>
          <p className="text-white/35 text-[0.95rem] mb-10">
            Free forever for rooms up to 8 people.
          </p>
          <a
            href="#"
            className="bg-primary hover:bg-primary-hover text-text text-[0.95rem] font-medium px-8 py-4 rounded-xl transition-all hover:-translate-y-px inline-block"
          >
            Create a room
          </a>
        </div>
      </section>
    </div>
  );
}
