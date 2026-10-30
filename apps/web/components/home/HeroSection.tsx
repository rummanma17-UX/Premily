import Link from "next/link";
import { ShieldCheck, Store, Truck } from "lucide-react";
import { CategorySidebar } from "./CategorySections";
import type { Category } from "@/types";

const features = [
  {
    icon: Store,
    title: "Your branded storefront",
    description: "Give your business a dedicated home online.",
  },
  {
    icon: ShieldCheck,
    title: "Products & inventory",
    description: "Organize products and keep stock in view.",
  },
  {
    icon: Truck,
    title: "Order management",
    description: "Keep customer orders and fulfillment organized.",
  },
];

export function HeroSection({ categories }: { categories: Category[] }) {
  return (
    <section className="grid gap-4 lg:grid-cols-[230px_minmax(0,1fr)_250px]">
      <CategorySidebar categories={categories} />

      <div className="relative h-56 overflow-hidden rounded-2xl bg-dark sm:h-80 lg:h-105">
        {/* eslint-disable-next-line @next/next/no-img-element -- remote demo image; replace with approved PREMILY artwork later */}
        <img
          src="https://picsum.photos/id/1068/1200/700"
          alt="Warm, modern living room"
          className="absolute inset-0 size-full object-cover opacity-70"
        />
        <div className="absolute inset-0 flex flex-col justify-center bg-linear-to-r from-dark/90 to-transparent p-6 text-cream sm:p-12">
          <h1 className="max-w-md font-serif text-2xl leading-tight sm:text-4xl">
            Your Store. Your Brand.
          </h1>
          <p className="mt-2 max-w-sm text-sm text-cream/80">
            Launch a branded storefront and manage products and orders with
            PREMILY.
          </p>
          <Link
            href="/seller/register"
            className="gbtn mt-5 w-fit rounded-full px-6 py-2.5 text-sm"
          >
            Start Your Store
          </Link>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2" aria-hidden="true">
            <span className="h-2 w-6 rounded-full bg-gold" />
            <span className="size-2 rounded-full bg-white/60" />
            <span className="size-2 rounded-full bg-white/60" />
          </div>
        </div>
      </div>

      <div className="hidden flex-col gap-4 lg:flex">
        {features.map(({ icon: Icon, title, description }) => (
          <article key={title} className="premily-card flex-1 p-4">
            <Icon className="size-6 text-deep" aria-hidden="true" />
            <h2 className="mt-2 font-bold">{title}</h2>
            <p className="mt-1 text-xs text-muted">{description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
