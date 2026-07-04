import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="font-inter min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Hero */}
      <section className="relative overflow-hidden min-h-[95vh] flex items-center justify-center px-4 sm:px-6 py-12">
        <img
          src="/poster.png"
          aria-hidden="true"
          className="fade-image absolute inset-0 w-full h-full object-cover scale-200 sm:scale-100 sm:object-[0%_56%]"
          loading="eager"
        />

        <div className="absolute inset-0 bg-linear-to-b from-background via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-b from-background to-transparent" />
        <div className="absolute inset-0 bg-linear-to-b from-background to-transparent sm:hidden" />
        <div className="absolute inset-0 bg-linear-to-r from-background to-transparent" />
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/15 to-transparent" />

        <div className="relative z-10 flex flex-col items-center text-center max-w-4xl">
          <h1 className="fade-1 font-title text-4xl sm:text-6xl md:text-9xl leading-[1.05] tracking-[0.02em] text-primary mb-2 wrap-break-word">
            watchroom.party
          </h1>

          <h2 className="fade-2 font-title text-xl sm:text-3xl md:text-5xl leading-[1.1] tracking-[0.02em] text-primary/60 mb-4">
            Watch anything in a shared room.
          </h2>

          <p className="fade-3 text-sm sm:text-base md:text-[1.05rem] text-primary/40 leading-relaxed mb-8 max-w-md mx-auto">
            Completely for free. No signup required.
          </p>

          <div className="fade-4 flex justify-center gap-2 sm:gap-3">
            <Link
              to="/create-room"
              className="bg-primary hover:bg-primary-hover text-background text-xs sm:text-sm font-semibold px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-all hover:-translate-y-0.5 text-center duration-200"
            >
              Create a room
            </Link>

            <Link
              to="/create-room"
              className="bg-primary hover:bg-primary-hover text-background text-xs sm:text-sm font-semibold px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-all hover:-translate-y-0.5 text-center duration-200"
            >
              Join a room
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
