import { useEffect } from "react";
import { utils, animate, stagger } from "animejs";

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

    const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

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

      utils.$(".dot").forEach((d: any) => {
        d.style.transform = "translateY(0px) scale(1)";
        d.style.backgroundColor = "rgba(255,255,255,0.4)";
      });
    };

    const setTyping = (on: boolean) => {
      const el = utils.$(".typing")[0];
      if (!el) return;

      return new Promise<void>((resolve) => {
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

          await new Promise<void>((resolve) => {
            animate(bubbles[i], {
              opacity: [0, 1],
              translateX: [-6, 0],
              duration: 340,
              ease: "outBack(1.4)",
              onComplete: () => resolve(),
            });
          });

          await setTyping(false);

          await delay(900 + i * 200);
        }

        await delay(800);

        await new Promise<void>((resolve) => {
          animate(bubbles, {
            opacity: [1, 0],
            translateX: [0, -4],
            duration: 280,
            ease: "inQuad",
            delay: stagger(60),
            onComplete: () => resolve(),
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
    <section id="preview" className="px-4 sm:px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 sm:mb-10 max-w-2xl">
          <span className="eyebrow text-primary-soft">The watch party</span>
          <h2 className="display-lg mt-3">
            A shared screen, and the group right beside it
          </h2>
          <p className="mt-4 text-muted">
            Everyone sees the same frame at the same second, with the chat alive
            on the right. This is what a room looks like.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-[1.7fr_1fr]">
          {/* Left: Video mockup */}
          <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl">
            <div className="flex items-center gap-2 border-b border-line bg-background/60 px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-critical/70"></span>
              <span className="h-3 w-3 rounded-full bg-primary-soft/50"></span>
              <span className="h-3 w-3 rounded-full bg-white/15"></span>
              <span className="ml-3 truncate text-xs text-faint">
                watchtogether.app/room/movie-night
              </span>
            </div>
            <div className="relative aspect-video bg-gradient-to-br from-[#1c2540] via-[#161d31] to-[#0d1320]">
              <div id="video-jitter" className="absolute inset-0 bg-white/5" />
              <div
                id="screen-scanlines"
                className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.03)_3px)]"
              />
              <div id="screen-glow" className="absolute inset-0 bg-primary/20" />
              <div id="screen-ray" className="absolute inset-0 bg-white/5" />
              
              <div className="absolute inset-0 grid grid-cols-4 gap-px opacity-[0.06]">
                <div className="bg-white"></div>
                <div className="bg-white"></div>
                <div className="bg-white"></div>
                <div className="bg-white"></div>
                <div className="bg-white"></div>
                <div className="bg-white"></div>
                <div className="bg-white"></div>
                <div className="bg-white"></div>
                <div className="bg-white"></div>
                <div className="bg-white"></div>
                <div className="bg-white"></div>
                <div className="bg-white"></div>
              </div>
              <div className="absolute left-4 top-4 flex items-center gap-2 rounded-md bg-critical px-2.5 py-1 text-[0.65rem] font-bold tracking-wide text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-white"></span>LIVE
              </div>
              <div className="absolute right-4 top-4 rounded-md bg-black/40 px-2.5 py-1 text-[0.65rem] font-semibold text-text/80">
                6 watching
              </div>
              <div className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary/90 shadow-lg shadow-primary/40">
                <span className="ml-1 inline-block border-y-[12px] border-l-[20px] border-y-transparent border-l-text"></span>
              </div>
            </div>
            <div className="bg-background/60 px-4 py-3">
              <div className="relative h-1.5 w-full rounded-full bg-white/10">
                <div id="video-progress" className="absolute inset-y-0 left-0 bg-primary" style={{ width: '0%' }} />
              </div>
              <div className="mt-2 flex items-center justify-between text-[0.7rem] text-faint">
                <span id="video-time">00:00 / 12:18</span>
                <span className="flex items-center gap-1.5 text-primary-soft">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary-soft"></span>
                  In sync with everyone
                </span>
                <span>1:54:08</span>
              </div>
            </div>
          </div>

          {/* Right: Chat panel */}
          <div className="flex flex-col rounded-2xl border border-line bg-surface">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <span className="text-sm font-bold">Room chat</span>
              <span className="text-[0.7rem] text-faint">4 online</span>
            </div>
            <div className="flex flex-1 flex-col gap-4 p-4">
              <div id="cb1" className="flex items-start gap-2.5 opacity-0">
                <span className="mt-0.5 h-7 w-7 flex-none rounded-full bg-gradient-to-br from-[#6f80cf] to-[#34416f]"></span>
                <div>
                  <div className="text-[0.7rem] font-semibold text-faint">Maya</div>
                  <div className="mt-1 inline-block rounded-2xl px-3 py-2 text-sm rounded-tl-sm bg-surface-2 text-text/85">
                    this part is so good
                  </div>
                </div>
              </div>
              <div id="cb2" className="flex items-start gap-2.5 flex-row-reverse text-right opacity-0">
                <span className="mt-0.5 h-7 w-7 flex-none rounded-full bg-gradient-to-br from-[#8ea0e8] to-[#4059ad]"></span>
                <div>
                  <div className="text-[0.7rem] font-semibold text-faint">You</div>
                  <div className="mt-1 inline-block rounded-2xl px-3 py-2 text-sm rounded-tr-sm bg-primary text-text">
                    omg this part 😭
                  </div>
                </div>
              </div>
              <div id="cb3" className="flex items-start gap-2.5 opacity-0">
                <span className="mt-0.5 h-7 w-7 flex-none rounded-full bg-gradient-to-br from-[#6f80cf] to-[#34416f]"></span>
                <div>
                  <div className="text-[0.7rem] font-semibold text-faint">Maya</div>
                  <div className="mt-1 inline-block rounded-2xl px-3 py-2 text-sm rounded-tl-sm bg-surface-2 text-text/85">
                    I KNOW wait for it
                  </div>
                </div>
              </div>
              <div id="cb4" className="flex items-start gap-2.5 opacity-0">
                <span className="mt-0.5 h-7 w-7 flex-none rounded-full bg-gradient-to-br from-[#cf6f9c] to-[#6f3454]"></span>
                <div>
                  <div className="text-[0.7rem] font-semibold text-faint">Theo</div>
                  <div className="mt-1 inline-block rounded-2xl px-3 py-2 text-sm rounded-tl-sm bg-surface-2 text-text/85">
                    pause!! I need a snack
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t border-line p-3">
              <div className="flex items-center gap-2 rounded-full border border-line bg-background/60 px-4 py-2.5">
                <span className="text-sm text-faint">Say something…</span>
                <span className="ml-auto flex h-7 w-7 items-center justify-center rounded-full bg-primary">
                  <span className="inline-block border-y-[5px] border-l-[8px] border-y-transparent border-l-text"></span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Mockup;
