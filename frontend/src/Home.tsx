import { useEffect, useState } from "react";
import "./index.css";
import { animate, scrambleText, utils } from "animejs";
import Mockup from "./Mockup";
import CreateRoom from "./CreateRoom";

export default function Home() {
  const [open, setOpen] = useState(false);

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
    <div className="font-sans min-h-screen bg-background text-foreground overflow-x-hidden overflow-y-hidden">
      {/* dim layer */}
      {open && (
        <div
          className="fixed inset-0 bg-black/70 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <CreateRoom onClose={() => setOpen(false)} />
        </div>
      )}

      {/* Hero */}
      <section className="relative overflow-hidden px-6 pb-28 pt-24 sm:pt-32 mb-10 min-h-[80vh] flex items-center">
        <img
          src="/poster.png"
          className="absolute inset-0 w-full h-full object-cover object-[0%_56%]"
        />

        <div className="absolute inset-0 bg-linear-to-b from-black via-black/10 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-r from-black to-transparent" />
        <div className="absolute inset-0 bg-linear-to-r from-black to-transparent" />
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/15 to-transparent" />

        <div className="relative z-10 max-w-2xl text-left ml-15">
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
              onClick={() => setOpen(true)}
              className="bg-primary hover:bg-primary-hover text-text text-sm font-medium px-6 py-3 rounded-lg transition-all hover:-translate-y-0.5"
            >
              Create a room
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
    </div>
  );
}
