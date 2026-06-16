export default function Cinema() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div
        className="absolute inset-x-0 top-0 flex h-8 items-center gap-5 bg-[#0c111d] px-5"
        aria-hidden="true"
      >
        {Array.from({ length: 28 }).map((_, i) => (
          <span
            key={i}
            className="h-3.5 w-4 flex-none rounded-sm bg-white/[0.07]"
          />
        ))}
      </div>

      <div
        className="absolute inset-x-0 top-8 bottom-8 grid grid-cols-6 gap-3 p-4 opacity-[0.28]"
        aria-hidden="true"
      >
        {Array.from({ length: 18 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-line bg-linear-to-br from-surface-2 to-surface"
          />
        ))}
      </div>

      <div
        className="absolute inset-x-0 bottom-0 flex h-8 items-center gap-5 bg-[#0c111d] px-5"
        aria-hidden="true"
      >
        {Array.from({ length: 28 }).map((_, i) => (
          <span
            key={i}
            className="h-3.5 w-4 flex-none rounded-sm bg-white/[0.07]"
          />
        ))}
      </div>

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(80%_70%_at_30%_30%,transparent,rgba(18,24,38,0.35)_60%,rgba(18,24,38,0.75))]"
      />
    </div>
  );
}
