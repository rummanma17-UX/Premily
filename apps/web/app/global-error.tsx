"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
        <button
          onClick={() => reset()}
          className="mt-4 rounded bg-[#B8924B] px-4 py-2 text-white font-medium hover:opacity-90"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
