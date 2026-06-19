import { useEffect, useRef, useCallback } from "react";
import { animate, stagger } from "animejs";

export default function Mockup() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(false);
  const animationCleanup = useRef<(() => void)[]>([]);
  const dotTimeoutsRef = useRef<number[]>([]);
  const stopDotsRef = useRef<(() => void) | null>(null);

  const cleanup = useCallback(() => {
    animationCleanup.current.forEach((fn) => fn());
    animationCleanup.current = [];
    dotTimeoutsRef.current.forEach((id) => clearTimeout(id));
    dotTimeoutsRef.current = [];
    if (stopDotsRef.current) {
      stopDotsRef.current();
      stopDotsRef.current = null;
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    const delay = (ms: number) =>
      new Promise<boolean>((resolve) => {
        const id = window.setTimeout(() => {
          resolve(!mountedRef.current);
        }, ms);
        dotTimeoutsRef.current.push(id);
        return id;
      });

    const revertAnim = (instance: any) => {
      if (instance && typeof instance.revert === "function") {
        instance.revert();
      }
    };

    const startDots = (dots: HTMLElement[]) => {
      let activeDot = 0;
      let running = true;

      const cycle = () => {
        if (!running || !mountedRef.current) return;

        const current = dots[activeDot];
        const next = dots[(activeDot + 1) % dots.length];

        const a1 = animate(current, {
          translateY: [0, -7, 0],
          scale: [1, 1.15, 1],
          duration: 520,
          ease: "inOutSine",
        });
        animationCleanup.current.push(() => revertAnim(a1));

        const a2 = animate(current, {
          backgroundColor: [
            "rgba(255,255,255,0.4)",
            "rgba(255,255,255,0.9)",
            "rgba(255,255,255,0.4)",
          ],
          duration: 520,
          ease: "linear",
        });
        animationCleanup.current.push(() => revertAnim(a2));

        const a3 = animate(next, {
          backgroundColor: ["rgba(255,255,255,0.4)", "rgba(255,255,255,0.6)"],
          duration: 900,
          ease: "linear",
        });
        animationCleanup.current.push(() => revertAnim(a3));

        activeDot = (activeDot + 1) % dots.length;

        const id = window.setTimeout(cycle, 320);
        dotTimeoutsRef.current.push(id);
      };

      cycle();

      return () => {
        running = false;
        dots.forEach((d) => {
          d.style.transform = "translateY(0px) scale(1)";
          d.style.backgroundColor = "rgba(255,255,255,0.4)";
        });
      };
    };

    const resetBubbles = (bubbles: HTMLElement[]) => {
      bubbles.forEach((b) => {
        b.style.opacity = "0";
        b.style.transform = "translateX(-6px)";
      });
    };

    const runChatLoop = async (
      bubbles: HTMLElement[],
      typingEl: HTMLElement,
      dots: HTMLElement[],
    ) => {
      resetBubbles(bubbles);

      while (mountedRef.current) {
        for (let i = 0; i < bubbles.length; i++) {
          if (!mountedRef.current) return;

          const a1 = animate(typingEl, {
            opacity: [0, 1],
            translateY: [4, 0],
            duration: 180,
            ease: "outQuad",
          });
          animationCleanup.current.push(() => revertAnim(a1));

          const typingReady = await delay(180);
          if (typingReady || !mountedRef.current) return;

          const stopFn = startDots(dots);
          stopDotsRef.current = stopFn;

          const dotsReady = await delay(400);
          if (dotsReady || !mountedRef.current) {
            stopFn();
            return;
          }

          const a2 = animate(bubbles[i], {
            opacity: [0, 1],
            translateX: [-6, 0],
            duration: 340,
            ease: "outBack(1.4)",
          });
          animationCleanup.current.push(() => revertAnim(a2));

          const bubbleReady = await delay(340);
          if (bubbleReady || !mountedRef.current) {
            stopFn();
            return;
          }

          const a3 = animate(typingEl, {
            opacity: [1, 0],
            translateY: [0, 4],
            duration: 180,
            ease: "outQuad",
          });
          animationCleanup.current.push(() => revertAnim(a3));

          const typingOutReady = await delay(180);
          if (typingOutReady || !mountedRef.current) {
            stopFn();
            return;
          }
          stopFn();
          stopDotsRef.current = null;

          const pauseReady = await delay(900 + i * 200);
          if (pauseReady || !mountedRef.current) return;
        }

        const waitReady = await delay(800);
        if (waitReady || !mountedRef.current) return;

        const a4 = animate(bubbles, {
          opacity: [1, 0],
          translateX: [0, -4],
          duration: 280,
          ease: "inQuad",
          delay: stagger(60),
        });
        animationCleanup.current.push(() => revertAnim(a4));

        const fadeReady = await delay(280 + bubbles.length * 60 + 100);
        if (fadeReady || !mountedRef.current) return;

        resetBubbles(bubbles);

        const resetReady = await delay(600);
        if (resetReady || !mountedRef.current) return;
      }
    };

    if (!containerRef.current) return;

    const node = containerRef.current;

    const timeEl = node.querySelector<HTMLSpanElement>("[data-time]");
    const videoProgress = node.querySelector<HTMLDivElement>("[data-progress]");
    const videoJitter = node.querySelector<HTMLDivElement>("[data-jitter]");
    const screenGlow = node.querySelector<HTMLDivElement>("[data-glow]");
    const screenScanlines =
      node.querySelector<HTMLDivElement>("[data-scanlines]");
    const screenRay = node.querySelector<HTMLDivElement>("[data-ray]");
    const typingEl = node.querySelector<HTMLDivElement>("[data-typing]");
    const bubbles = Array.from(
      node.querySelectorAll<HTMLDivElement>("[data-bubble]"),
    );
    const dots = Array.from(
      node.querySelectorAll<HTMLSpanElement>("[data-dot]"),
    );

    const total = 12 * 60 + 18;
    const state = { t: 0, p: 0 };

    const animTime = animate(state, {
      t: total,
      p: 1,
      duration: 18000,
      easing: "linear",
      loop: true,
      onUpdate: () => {
        if (!timeEl || !videoProgress) return;
        const format = (s: number) => {
          const m = Math.floor(s / 60);
          const sec = Math.floor(s % 60);
          return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
        };
        timeEl.textContent = `${format(state.t)} / 12:18`;
        videoProgress.style.width = `${state.p * 100}%`;
      },
    });
    animationCleanup.current.push(() => revertAnim(animTime));

    if (videoJitter) {
      const a = animate(videoJitter, {
        opacity: [0.02, 0.08],
        translateX: [-1, 1],
        translateY: [-1, 1],
        duration: 90,
        loop: true,
        alternate: true,
        ease: "linear",
      });
      animationCleanup.current.push(() => revertAnim(a));
    }

    if (screenGlow) {
      const a = animate(screenGlow, {
        opacity: [0.12, 0.28],
        duration: 1800,
        ease: "inOutSine",
        loop: true,
        alternate: true,
      });
      animationCleanup.current.push(() => revertAnim(a));
    }

    if (screenScanlines) {
      const a = animate(screenScanlines, {
        opacity: [0.06, 0.14],
        duration: 120,
        ease: "linear",
        loop: true,
        alternate: true,
      });
      animationCleanup.current.push(() => revertAnim(a));
    }

    if (screenRay) {
      const a = animate(screenRay, {
        opacity: [0.04, 0.1],
        duration: 2400,
        ease: "inOutSine",
        loop: true,
        alternate: true,
      });
      animationCleanup.current.push(() => revertAnim(a));
    }

    if (bubbles.length > 0 && typingEl && dots.length > 0) {
      runChatLoop(bubbles, typingEl, dots);
    }

    return () => {
      mountedRef.current = false;
      cleanup();
    };
  }, [cleanup]);

  return (
    <section id="preview" className="px-4 sm:px-6 py-16 sm:py-20 w-full">
      <div className="mx-auto w-full">
        <div
          ref={containerRef}
          className="grid gap-4 lg:grid-cols-[1.7fr_1fr] w-full min-w-0"
        >
          {/* Left: Video mockup */}
          <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl">
            <div className="flex items-center gap-2 border-b border-line bg-background/60 px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-critical/70"></span>
              <span className="h-3 w-3 rounded-full bg-primary/70"></span>
              <span className="h-3 w-3 rounded-full bg-white/15"></span>
              <span className="ml-3 truncate text-xs text-gray-500">
                watchtogether.app/room/movie-night
              </span>
            </div>
            <div className="relative aspect-video bg-gradient-to-br from-surface-2/10 to-surface/10">
              <div data-jitter className="absolute inset-0 bg-white/5" />
              <div
                data-scanlines
                className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.03)_3px)]"
              />
              <div data-glow className="absolute inset-0 bg-primary/20" />
              <div data-ray className="absolute inset-0 bg-white/5" />

              <div className="absolute left-4 top-4 flex items-center gap-2 rounded-md bg-critical px-2.5 py-1 text-[0.65rem] font-bold tracking-wide text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-white"></span>LIVE
              </div>
            </div>
            <div className="bg-background/60 px-4 py-3">
              <div className="relative h-1.5 w-full rounded-full bg-white/10">
                <div
                  data-progress
                  className="absolute inset-y-0 left-0 bg-primary"
                  style={{ width: "0%" }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-[0.7rem] text-faint">
                <span data-time className="text-faint">
                  00:00 / 12:18
                </span>
              </div>
            </div>
          </div>

          {/* Right: Chat panel */}
          <div className="flex flex-col rounded-2xl border border-line bg-surface/40 min-w-0 min-h-[400px]">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <span className="text-sm font-bold">Room chat</span>
              <span className="text-[0.7rem] text-faint">4 online</span>
            </div>
            <div className="flex flex-1 flex-col gap-4 p-4 overflow-hidden">
              <div data-bubble className="flex items-start gap-2.5 opacity-0">
                <span className="mt-0.5 h-7 w-7 flex-none rounded-full bg-linear-to-br from-[#cf6f9c] to-[#6f3454]"></span>
                <div>
                  <div className="text-[0.7rem] font-semibold">maya</div>
                  <div className="mt-1 inline-block rounded-2xl px-3 py-2 text-sm rounded-tl-sm bg-surface-2 text-foreground/85">
                    omg this part 😭
                  </div>
                </div>
              </div>
              <div
                data-bubble
                className="flex items-start gap-2.5 flex-row-reverse text-right opacity-0"
              >
                <span className="mt-0.5 h-7 w-7 flex-none rounded-full bg-linear-to-br from-[#8ea0e8] to-[#4059ad]"></span>
                <div>
                  <div className="text-[0.7rem] font-semibold text-faint">
                    you
                  </div>
                  <div className="mt-1 inline-block rounded-2xl px-3 py-2 text-sm rounded-tr-sm bg-primary text-foreground/85">
                    I KNOW wait for it
                  </div>
                </div>
              </div>
              <div data-bubble className="flex items-start gap-2.5 opacity-0">
                <span className="mt-0.5 h-7 w-7 flex-none rounded-full bg-linear-to-br from-[#cf6f9c] to-[#6f3454]"></span>
                <div>
                  <div className="text-[0.7rem] font-semibold text-faint">
                    maya
                  </div>
                  <div className="mt-1 inline-block rounded-2xl px-3 py-2 text-sm rounded-tl-sm bg-surface-2 text-text/85">
                    pause!! I need a snack
                  </div>
                </div>
              </div>
              <div
                data-bubble
                className="flex items-start gap-2.5 flex-row-reverse text-right opacity-0"
              >
                <span className="mt-0.5 h-7 w-7 flex-none rounded-full bg-linear-to-br from-[#8ea0e8] to-[#4059ad]"></span>
                <div>
                  <div className="text-[0.7rem] font-semibold text-faint">
                    you
                  </div>
                  <div className="mt-1 inline-block rounded-2xl px-3 py-2 text-sm rounded-tr-sm bg-primary text-foreground/85">
                    wait
                  </div>
                </div>
              </div>

              {/* typing + dots */}
              <div
                data-typing
                className="flex items-center gap-1.5 px-2 py-1 opacity-0 w-fit"
              >
                <span
                  data-dot
                  className="w-1.5 h-1.5 bg-white/40 rounded-full"
                />
                <span
                  data-dot
                  className="w-1.5 h-1.5 bg-white/40 rounded-full"
                />
                <span
                  data-dot
                  className="w-1.5 h-1.5 bg-white/40 rounded-full"
                />
              </div>
            </div>

            <div className="border-t border-line p-3">
              <div className="flex items-center gap-2 rounded-full border border-line bg-surface/40 px-4 py-2.5">
                <span className="text-sm text-gray-500">Send message...</span>
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
