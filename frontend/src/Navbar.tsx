export default function Navbar() {
  return (
    <nav className="absolute inset-x-0 top-0 z-50">
      <div className="mx-auto flex h-20 max-w-9xl items-center justify-between px-8">
        <a
          key={"watchroom.party"}
          href="/"
          className="font-title text-xl font-extrabold text-primary"
        >
          watchroom
          <span className="text-accent">.party</span>
        </a>
      </div>
    </nav>
  );
}
