import Link from "next/link";
import { Camera, Mail, Share2 } from "lucide-react";

const linkClass = "transition hover:text-gold";
const columnClass = "space-y-3";
const listClass = "space-y-2 text-cream/70";

export function SiteFooter() {
  return (
    <footer className="mt-10 bg-dark text-cream">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-12 text-xs md:grid-cols-3 lg:grid-cols-6">
        <div className="col-span-2 space-y-3">
          <Link
            href="/"
            className="font-serif text-xl font-bold tracking-widest text-gold"
          >
            PREMILY<span className="text-white">.</span>
          </Link>
          <p className="leading-relaxed text-cream/70">
            Create a branded online store, manage products and orders, and grow
            your business with PREMILY.
          </p>
        </div>

        <div className={columnClass}>
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-gold">
            Explore
          </h2>
          <ul className={listClass}>
            <li><Link href="/products" className={linkClass}>Browse stores &amp; products</Link></li>
            <li><Link href="/how-it-works" className={linkClass}>How PREMILY works</Link></li>
            <li><Link href="/pricing" className={linkClass}>Seller subscriptions</Link></li>
          </ul>
        </div>

        <div className={columnClass}>
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-gold">
            For sellers
          </h2>
          <ul className={listClass}>
            <li><Link href="/login?tab=signup" className={linkClass}>Create a store</Link></li>
            <li><Link href="/login" className={linkClass}>Seller login</Link></li>
            <li><Link href="/seller/guide" className={linkClass}>Onboarding guide</Link></li>
          </ul>
        </div>

        <div className={columnClass}>
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-gold">
            Customer support
          </h2>
          <ul className={listClass}>
            <li><Link href="/contact" className={linkClass}>Contact support</Link></li>
            <li><Link href="/help" className={linkClass}>FAQs</Link></li>
            <li><Link href="/help/orders-delivery-returns" className={linkClass}>Orders, delivery &amp; returns</Link></li>
          </ul>
        </div>

        <div className={columnClass}>
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-gold">
            Policies
          </h2>
          <ul className={listClass}>
            <li><Link href="/terms" className={linkClass}>Terms of service</Link></li>
            <li><Link href="/privacy" className={linkClass}>Privacy policy</Link></li>
            <li><Link href="/cookies" className={linkClass}>Cookie policy</Link></li>
            <li><Link href="/seller-agreement" className={linkClass}>Seller agreement</Link></li>
            <li><Link href="/refunds" className={linkClass}>Refund policy</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gold/20 px-4 py-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-xs text-cream/70 md:flex-row">
          <p>© {new Date().getFullYear()} PREMILY. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="mailto:support@premily.com" className="flex items-center gap-1.5 transition hover:text-gold">
              <Mail className="size-4" aria-hidden="true" />
              support@premily.com
            </a>
            <a href="#" aria-label="PREMILY on Facebook" className="transition hover:text-gold">
              <Share2 className="size-4" aria-hidden="true" />
            </a>
            <a href="#" aria-label="PREMILY on Instagram" className="transition hover:text-gold">
              <Camera className="size-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}


