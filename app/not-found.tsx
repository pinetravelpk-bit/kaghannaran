import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-5 bg-pine px-4 text-center text-ground">
      <span className="font-mono text-signal">404 · OFF THE TRAIL</span>
      <h1 className="font-display text-6xl font-extrabold">This path washed out.</h1>
      <p className="max-w-md text-mist">The page you’re looking for doesn’t exist, or the listing is not approved yet.</p>
      <Link href="/" className="rounded-full bg-amber px-6 py-3.5 font-semibold text-ink">Back to the valley</Link>
    </main>
  );
}
