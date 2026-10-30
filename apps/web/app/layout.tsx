import type { Metadata } from "next";
import { Cinzel, Plus_Jakarta_Sans } from "next/font/google";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import "./globals.css";

export const dynamic = "force-dynamic";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://premily.com"),
  title: {
    default: "PREMILY — Luxury E-Commerce & Branded Storefronts Bangladesh",
    template: "%s | PREMILY",
  },
  description:
    "Launch your branded luxury online store in Bangladesh with PREMILY. Curated furniture, architectural decor, boutique vendor storefronts, and reliable 64-district delivery.",
  keywords: [
    "PREMILY",
    "ecommerce bangladesh",
    "online store builder bd",
    "luxury furniture dhaka",
    "boutique storefront",
    "premily mart",
    "bKash online shopping",
    "artisan home decor",
  ],
  authors: [{ name: "PREMILY Architecture & Commerce" }],
  creator: "PREMILY",
  publisher: "PREMILY",
  formatDetection: {
    email: false,
    address: true,
    telephone: true,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_BD",
    url: "https://premily.com",
    siteName: "PREMILY",
    title: "PREMILY — Luxury E-Commerce & Branded Storefronts Bangladesh",
    description:
      "Create and manage your branded luxury online store with PREMILY. Zero commission, ৳150/month vendor subscriptions, and frictionless checkout across Bangladesh.",
  },
  twitter: {
    card: "summary_large_image",
    title: "PREMILY — Architectural Luxury Living & Storefronts",
    description:
      "Seller-focused e-commerce SaaS platform for Bangladesh. Branded storefronts, artisanal living, and 64-district delivery.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const schemaOrgJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://premily.com/#organization",
      name: "PREMILY",
      url: "https://premily.com",
      description:
        "Seller-focused e-commerce SaaS platform and curated luxury marketplace in Bangladesh.",
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer service",
        areaServed: "BD",
        availableLanguage: ["en", "bn"],
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://premily.com/#website",
      url: "https://premily.com",
      name: "PREMILY",
      description: "Architectural luxury living and independent boutique seller storefronts.",
      publisher: {
        "@id": "https://premily.com/#organization",
      },
      potentialAction: {
        "@type": "SearchAction",
        target: "https://premily.com/products?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${cinzel.variable} ${jakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrgJsonLd) }}
        />
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
