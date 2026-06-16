import { useEffect } from "react";
import { utils, animate, stagger } from "animejs";

function Screen() {
  return (
    <div className="flex-1 bg-[#0d1117] flex flex-col justify-center items-center relative overflow-hidden">
      <div id="video-jitter" className="absolute inset-0 bg-white/5" />

      <div className="absolute bottom-2 left-3 right-3">
        <div id="video-progress" className="h-[3px] bg-primary rounded-full" />

        <div className="flex justify-between mt-1 text-[0.6rem] text-white/30">
          <span id="video-time">00:00 / 12:18</span>
        </div>
      </div>
    </div>
  );
}

function Chat() {
  return (
    <div className="w-[280px] bg-[#141e2e] border-l border-white/10 flex flex-col">
      <div className="px-3 py-3 text-[0.65rem] font-semibold uppercase text-white/25 border-b border-white/10">
        Chat
      </div>

      <div className="flex-1 p-3 flex flex-col gap-3 overflow-hidden">
        <div id="cb1" className="flex flex-col gap-1 opacity-0">
          <span className="text-[0.58rem] text-white/25">maya</span>
          <div className="bg-[#1e2c42] rounded-lg px-3 py-2 text-[0.65rem] text-white/60">
            omg this part 😭
          </div>
        </div>

        <div id="cb2" className="flex flex-col gap-1 opacity-0">
          <span className="text-[0.58rem] text-white/25">you</span>
          <div className="bg-[#2a3a6a] rounded-lg px-3 py-2 text-[0.65rem] text-white/70">
            I KNOW wait for it
          </div>
        </div>

        <div id="cb3" className="flex flex-col gap-1 opacity-0">
          <span className="text-[0.58rem] text-white/25">maya</span>
          <div className="bg-[#1e2c42] rounded-lg px-3 py-2 text-[0.65rem] text-white/60">
            pause!! I need a snack
          </div>
        </div>

        <div id="cb4" className="flex flex-col gap-1 opacity-0">
          <span className="text-[0.58rem] text-white/25">you</span>
          <div className="bg-[#1e2c42] rounded-lg px-3 py-2 text-[0.65rem] text-white/60">
            wait
          </div>
        </div>
      </div>

      <div className="px-3 pb-2">
        <div className="typing opacity-0 flex gap-[4px] px-2 py-1 w-fit">
          <span className="dot w-1.5 h-1.5 bg-white/40 rounded-full" />
          <span className="dot w-1.5 h-1.5 bg-white/40 rounded-full" />
          <span className="dot w-1.5 h-1.5 bg-white/40 rounded-full" />
        </div>
      </div>

      <div className="p-2 border-t border-white/10">
        <div className="bg-[#1e2a40] rounded-md h-8 px-3 flex items-center text-[0.62rem] text-white/20">
          Message...
        </div>
      </div>
    </div>
  );
}

function Mockup() {
  useEffect(() => {
    let cancelled = false;

    const timeEl = document.getElementById("video-time");
    const total = 12 * 60 + 18;
    const state = { t: 0, p: 0 };

    animate(state, {
      t: total,
      p: 1,
      duration: 18000,
      easing: "linear",
      loop: true,
      onUpdate: () => {
        if (!timeEl) return;

        const format = (s) => {
          const m = Math.floor(s / 60);
          const sec = Math.floor(s % 60);
          return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
        };

        timeEl.textContent = `${format(state.t)} / 12:18`;

        const progress = document.getElementById("video-progress");
        if (progress) {
          progress.style.width = `${state.p * 100}%`;
        }
      },
    });

    animate("#video-jitter", {
      opacity: [0.02, 0.08],
      translateX: [-1, 1],
      translateY: [-1, 1],
      duration: 90,
      loop: true,
      alternate: true,
      ease: "linear",
    });

    animate("#screen-glow", {
      opacity: [0.12, 0.28],
      duration: 1800,
      ease: "inOutSine",
      loop: true,
      alternate: true,
    });

    animate("#video-progress", {
      duration: 18000,
      ease: "linear",
      loop: true,
    });

    animate("#screen-scanlines", {
      opacity: [0.06, 0.14],
      duration: 120,
      ease: "linear",
      loop: true,
      alternate: true,
    });

    animate("#screen-ray", {
      opacity: [0.04, 0.1],
      duration: 2400,
      ease: "inOutSine",
      loop: true,
      alternate: true,
    });

    const bubbles = ["#cb1", "#cb2", "#cb3", "#cb4"];

    const delay = (ms) => new Promise((r) => setTimeout(r, ms));

    let dotLoopRunning = false;
    let activeDot = 0;

    const startDots = () => {
      const dots = utils.$(".dot");
      dotLoopRunning = true;

      const cycle = () => {
        if (!dotLoopRunning) return;

        const current = dots[activeDot];
        const next = dots[(activeDot + 1) % 3];

        animate(current, {
          translateY: [0, -7, 0],
          scale: [1, 1.15, 1],
          duration: 520,
          ease: "inOutSine",
        });

        animate(current, {
          backgroundColor: [
            "rgba(255,255,255,0.4)",
            "rgba(255,255,255,0.9)",
            "rgba(255,255,255,0.4)",
          ],
          duration: 520,
          ease: "linear",
        });

        animate(next, {
          backgroundColor: ["rgba(255,255,255,0.4)", "rgba(255,255,255,0.6)"],
          duration: 900,
          ease: "linear",
        });

        activeDot = (activeDot + 1) % 3;
        setTimeout(cycle, 320);
      };

      cycle();
    };

    const stopDots = () => {
      dotLoopRunning = false;

      utils.$(".dot").forEach((d) => {
        d.style.transform = "translateY(0px) scale(1)";
        d.style.backgroundColor = "rgba(255,255,255,0.4)";
      });
    };

    const setTyping = (on) => {
      const el = utils.$(".typing")[0];
      if (!el) return;

      return new Promise((resolve) => {
        animate(el, {
          opacity: on ? [0, 1] : [1, 0],
          translateY: on ? [4, 0] : [0, 4],
          duration: 180,
          ease: "outQuad",
          onComplete: () => {
            if (on) startDots();
            else stopDots();
            resolve();
          },
        });
      });
    };

    const chatLoop = async () => {
      while (!cancelled) {
        for (let i = 0; i < bubbles.length; i++) {
          if (cancelled) return;

          await setTyping(true);
          await delay(400);

          await new Promise((resolve) => {
            animate(bubbles[i], {
              opacity: [0, 1],
              translateX: [-6, 0],
              duration: 340,
              ease: "outBack(1.4)",
              onComplete: resolve,
            });
          });

          await setTyping(false);
          await delay(900 + i * 200);
        }

        await delay(800);

        await new Promise((resolve) => {
          animate(bubbles, {
            opacity: [1, 0],
            translateX: [0, -4],
            duration: 280,
            ease: "inQuad",
            delay: stagger(60),
            onComplete: resolve,
          });
        });

        await delay(600);
      }
    };

    chatLoop();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="relative w-full max-w-3xl mx-auto h-[360px] bg-[#1a2235] border border-white/10 rounded-2xl overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,0.5)]">
      <div id="screen-ray" className="absolute inset-0 bg-white/5" />
      <div id="screen-glow" className="absolute inset-0 bg-primary/20" />
      <div
        id="screen-scanlines"
        className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.03)_3px)]"
      />

      <div className="relative z-20 flex h-full">
        <Screen />
        <Chat />
      </div>
    </div>
  );
}

export default Mockup;

