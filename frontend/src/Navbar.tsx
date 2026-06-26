const navLinks = new Map([
  ["Features", "#features"],
  ["Log in", "#login"],
  ["Get started", "#get-started"],
]);

export default function Navbar() {
  return (
    <nav className="absolute inset-x-0 top-0 z-50">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-8">
        <span className="font-syne text-xl font-extrabold text-foreground">
          WatchRoom
        </span>

        <div className="flex items-center gap-8">
          {[...navLinks.entries()].map(([label, href]) =>
            label === "Get started" ? (
              <a
                key={label}
                href={href}
                className="rounded-xl bg-primary/90 px-4 py-2 text-sm font-medium text-foreground transition-all hover:-translate-y-0.5 hover:bg-primary"
              >
                {label}
              </a>
            ) : (
              <a
                key={label}
                href={href}
                className="text-sm text-foreground/70 transition-colors hover:text-foreground"
              >
                {label}
              </a>
            ),
          )}
        </div>
      </div>
    </nav>
  );
}
