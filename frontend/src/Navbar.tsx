const navLinks = new Map([
  ["Home", "/"],
  ["How it works", "/how-it-works"],
  ["Create a room", "/create-room"],
]);

export default function Navbar() {
  return (
    <nav className="absolute inset-x-0 top-0 z-50">
      <div className="mx-auto flex h-20 max-w-9xl items-center justify-between px-8">
        <a
          key={"watchroom.party"}
          href="/"
          className="font-syne text-xl font-extrabold text-primary"
        >
          watchroom.party
        </a>

        <div className="flex items-center gap-8">
          {[...navLinks.entries()].map(([label, href]) => (
            <a
              key={label}
              href={href}
              className="text-sm font-medium text-primary/70 transition duration-200 hover:text-primary"
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
