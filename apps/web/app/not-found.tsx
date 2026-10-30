import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="font-serif text-6xl font-bold text-[#1E1916]">404</h1>
      <h2 className="mt-4 font-serif text-2xl font-semibold text-[#1E1916]">
        Page Not Found
      </h2>
      <p className="mt-2 max-w-md text-sm text-[#1E1916]/70">
        The boutique or page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-gradient-to-r from-[#B8924B] to-[#D4B375] px-6 py-2.5 font-sans text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
      >
        Return to Marketplace
      </Link>
    </main>
  );
}
