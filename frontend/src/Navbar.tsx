const navLinks = new Map([
  ["Features", "#features"],
  ["Log in", "#login"],
  ["Get started", "#get-started"],
]);

export default function Navbar() {
  return (
    <nav className="sticky top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 bg-background backdrop-blur-md border-b border-white/[0.06]">
      <span className="font-syne font-extrabold text-lg tracking-tight text-white">
        ShareView
      </span>

      <div className="flex items-center gap-5 md:gap-8">
        {[...navLinks.entries()].map(([label, href]) =>
          label === "Get started" ? (
            <a
              key={label}
              href={href}
              className="bg-primary text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors shadow-sm"
            >
              {label}
            </a>
          ) : (
            <a
              key={label}
              href={href}
              className="text-sm text-white/50 hover:text-white transition-colors"
            >
              {label}
            </a>
          ),
        )}
      </div>
    </nav>
  );
}
