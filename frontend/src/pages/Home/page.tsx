import { useEffect } from "react";
import "../../index.css";
import { animate, scrambleText, utils } from "animejs";
import Mockup from "./Mockup";
import { Link } from "react-router-dom";

export default function Home() {
  useEffect(() => {
    const [$scramble] = utils.$(".scramble");
    if (!$scramble) return;

    const texts = ["wherever you are", "whenever you want"];
    let i = 0;

    const play = () => {
      animate($scramble, {
        innerHTML: scrambleText({
          text: texts[i],
          revealRate: 15,
          from: "left",
        }),
        onComplete: () => {
          i = (i + 1) % texts.length;
          setTimeout(play, 3000);
        },
      });
    };

    play();
  }, []);

  return (
    <div className="font-inter min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Hero */}
      <section className="relative overflow-hidden px-6 p-12 min-h-[95vh] flex items-center">
        <img
          src="/poster.png"
          aria-hidden="true"
          className="fade-image absolute inset-0 w-full h-full object-cover scale-125 sm:scale-100 sm:object-[0%_56%]"
          loading="eager"
        />

        <div className="absolute inset-0 bg-linear-to-b from-black via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-r from-black to-transparent" />
        <div className="absolute inset-0 bg-linear-to-r from-black to-transparent" />
        <div className="absolute inset-0 bg-linear-to-r from-black to-transparent" />
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/15 to-transparent" />

        <div className="relative z-10 max-w-2xl text-left mx-auto md:ml-15">
          <h1 className="fade-1 font-title text-[clamp(2.5rem,6vw,5rem)] leading-[1.05] tracking-[0.01em] mb-6">
            Watch together,
            <br />
            <span className="text-primary scramble md:whitespace-nowrap">
              wherever you are
            </span>
          </h1>

          <p className="fade-2 text-[1.05rem] text-white/40 leading-relaxed mb-10 max-w-md">
            Sync your player with friends and chat in real-time
            <br />
            <b>Completely for free.</b>
          </p>

          <div className="fade-3 flex flex-col sm:flex-row gap-3">
            <Link
              to={`/room/${crypto.randomUUID()}`}
              className="bg-primary hover:bg-primary-hover text-text text-sm font-medium px-6 py-3 rounded-lg transition-all hover:-translate-y-0.5 text-center"
            >
              Create a room
            </Link>

            <a
              href="#demo"
              className="bg-transparent hover:bg-white/5 border border-white/15 hover:border-white/30 text-text text-sm font-medium px-6 py-3 rounded-lg transition-all hover:-translate-y-0.5 text-center"
            >
              Watch demo
            </a>
          </div>
        </div>
      </section>

      {/* Mockup */}
      <div
        id="demo"
        className="fade-3 relative w-full flex justify-center mb-24"
      >
        <div className="w-full max-w-6xl">
          <Mockup />
        </div>
      </div>
    </div>
  );
}
