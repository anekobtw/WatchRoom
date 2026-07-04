export default function Footer() {
  return (
    <footer className="w-full border-t border-primary/10 bg-background text-primary font-mulish">
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2">
          <div className="text-3xl font-semibold font-title">
            {" "}
            watchroom.<span className="text-accent">party</span>
          </div>
          <div className="text-primary/60">
            © Copyrighted anekobtw, {new Date().getFullYear()}. All rights
            reserved.
          </div>
        </div>

        <div className="flex gap-6 text-sm">
          <a
            href="#"
            className="hover:text-primary-hover transition duration-200"
          >
            Home
          </a>
          <a
            href="#"
            className="hover:text-primary-hover transition duration-200"
          >
            Getting started
          </a>
        </div>
      </div>
    </footer>
  );
}
