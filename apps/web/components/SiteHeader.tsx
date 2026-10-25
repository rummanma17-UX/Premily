import Link from "next/link";
import {
  Languages,
  MapPin,
  Search,
  ShoppingCart,
  UserRound,
} from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 bg-surface shadow-sm">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 sm:gap-6">
        <Link
          href="/"
          aria-label="PREMILY home"
          className="font-serif text-2xl font-bold tracking-widest text-dark"
        >
          PREMILY<span className="text-deep">.</span>
        </Link>

        <button
          type="button"
          className="ml-auto flex cursor-pointer items-center gap-1 rounded-full border border-gold/60 px-3 py-1 text-xs sm:hidden"
          aria-label="Choose language"
        >
          <Languages className="size-3.5" aria-hidden="true" />
          বাংলা
        </button>

        <button
          type="button"
          className="hidden cursor-pointer items-center gap-2 rounded-xl border border-gold/40 px-3 py-1.5 hover:bg-cream md:flex"
          aria-label="Delivery location: Dhaka, estimated one to two days"
        >
          <MapPin className="size-5 text-deep" aria-hidden="true" />
          <span className="text-left leading-tight">
            <span className="block text-[10px] text-muted">Deliver to</span>
            <span className="block text-sm font-semibold">Dhaka · 1–2 days</span>
          </span>
        </button>

        <form
          action="/products"
          method="get"
          role="search"
          className="order-last flex w-full min-w-0 overflow-hidden rounded-full border-2 border-gold bg-surface sm:order-none sm:w-auto sm:flex-1"
        >
          <label htmlFor="site-search" className="sr-only">
            Search products
          </label>
          <span className="hidden items-center border-r border-gold/40 bg-cream px-4 text-xs sm:flex">
            All
          </span>
          <input
            id="site-search"
            name="q"
            type="search"
            className="min-w-0 flex-1 px-4 py-2.5 text-sm outline-none"
            placeholder="Search products…"
          />
          <button
            type="submit"
            className="gbtn grid place-items-center px-5"
            aria-label="Search"
          >
            <Search className="size-4" aria-hidden="true" />
          </button>
        </form>

        <Link
          href="/login"
          className="hidden items-center gap-2 text-sm hover:text-deep lg:flex"
        >
          <UserRound className="size-5" aria-hidden="true" />
          Login / Sign up
        </Link>

        <Link
          href="/cart"
          aria-label="Shopping cart, 0 items"
          className="relative p-2 hover:text-deep"
        >
          <ShoppingCart className="size-6" aria-hidden="true" />
          <span className="gbtn absolute -right-0.5 -top-0.5 grid size-5 place-items-center rounded-full text-[10px]">
            0
          </span>
        </Link>
      </div>

      <div className="flex w-full items-center gap-1 bg-cream px-4 py-2 text-xs md:hidden">
        <MapPin className="size-3.5 text-deep" aria-hidden="true" />
        Deliver to: <b>Dhaka · 1–2 days</b>
      </div>
    </header>
  );
}
