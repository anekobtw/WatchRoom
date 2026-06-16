import { useEffect } from "react";
import "./index.css";
import { animate, scrambleText, utils } from "animejs";
import Mockup from "./Mockup";

export default function Home() {
  const texts = ["wherever you are", "whenever you want"];

  useEffect(() => {
    const [$scramble] = utils.$(".scramble");
    if (!$scramble) return;

    let i = 0;

    const run = () => {
      animate($scramble, {
        innerHTML: scrambleText({ text: texts[i], duration: 1100 }),
        duration: 1200,
        onComplete: () => {
          setTimeout(() => {
            i = (i + 1) % texts.length;
            run();
          }, 2000);
        },
      });
    };

    run();
  }, []);

  return (
    <div
      className="min-h-screen bg-background text-foreground overflow-x-hidden overflow-y-hidden"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Hero */}
      <section className="relative overflow-hidden px-6 pb-28 pt-24 sm:pt-32 mb-10 min-h-[80vh] flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url(/poster.png)",
            backgroundPosition: "center 57%",
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121826] via-[#121826]/40 to-transparent" />

        <div className="relative z-10 max-w-2xl text-left">
          <h1 className="font-syne font-extrabold text-[clamp(2.8rem,6vw,5rem)] leading-[1.05] tracking-[-0.03em] mb-6">
            Watch together,
            <br />
            <span className="text-primary scramble whitespace-nowrap">
              wherever you are
            </span>
          </h1>

          <p className="text-[1.05rem] text-white/40 leading-relaxed mb-10 max-w-md">
            Sync your player with friends and chat in real-time{" "}
            <b>Completely for free.</b>
          </p>

          <div className="flex gap-3 flex-wrap">
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
        </div>
      </section>

      {/* Mockup */}
      <div className="relative w-full flex justify-center mb-24">
        <div className="w-full max-w-6xl">
          <Mockup />
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
