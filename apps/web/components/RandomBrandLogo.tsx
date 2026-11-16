
"use client";

import Image from "next/image";
import { useSyncExternalStore } from "react";

type LogoChoice = "1" | "2";

const LOGOS = {
  "1": {
    src: "/logos/logo-1.v1.svg",
    width: 124,
  },
  "2": {
    src: "/logos/logo-2.v1.svg",
    width: 130,
  },
} as const;

const STORAGE_KEY = "premily:logo-choice:v1";

// Client-side external store
let cachedChoice: LogoChoice | null = null;

function getOrCreateChoice(): LogoChoice {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);

    if (saved === "1" || saved === "2") {
      return saved;
    }

    const selected: LogoChoice =
      Math.random() < 0.5 ? "1" : "2";

    sessionStorage.setItem(STORAGE_KEY, selected);

    return selected;
  } catch {
    return Math.random() < 0.5 ? "1" : "2";
  }
}

function subscribe(callback: () => void) {
  // Initialize the selection when React subscribes.
  if (cachedChoice === null && typeof window !== "undefined") {
    cachedChoice = getOrCreateChoice();
    callback();
  }

  return () => {};
}

function getSnapshot() {
  return cachedChoice;
}

function getServerSnapshot() {
  return null;
}

export function RandomBrandLogo() {
  const choice = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  // Consistent server and hydration fallback.
  if (!choice) {
    return (
      <span className="inline-flex h-10 w-135px shrink-0 items-center font-serif text-2xl font-bold tracking-widest text-dark">
        PREMILY<span className="text-deep">.</span>
      </span>
    );
  }

  const logo = LOGOS[choice];

  return (
    <span className="inline-flex h-10 w-135px shrink-0 items-center">
      <Image
        src={logo.src}
        alt=""
        width={logo.width}
        height={40}
        unoptimized
        priority
        className="h-10 w-auto max-w-full object-contain"
      />
    </span>
  );
}
