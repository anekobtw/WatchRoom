export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-primary px-6 text-center text-background">
      <h1 className="font-title text-3xl font-semibold">
        Room doesn't exist or you don't have permission to join it.
      </h1>
    </div>
  );
}
