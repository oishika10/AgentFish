"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import { Ship } from "lucide-react";

const DynamicLandingMap = dynamic(
  () => import("@/components/landing/LandingMap").then((mod) => mod.LandingMap),
  { ssr: false },
);

export function HeroSection() {
  const [userType, setUserType] = useState("");
  const [product, setProduct] = useState("");

  const canExplore = userType.trim().length > 0 && product.trim().length > 0;

  return (
    <section className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 z-0">
        <DynamicLandingMap />
      </div>

      <div className="absolute inset-0 z-[1] bg-white/40" />

      <div className="relative z-[2] flex min-h-screen flex-col items-center justify-center px-4">
        <div className="mb-10 flex items-center gap-2.5">
          <Ship className="h-8 w-8 text-blue-600" />
          <span className="text-2xl font-bold tracking-tight text-zinc-900">AgentFish</span>
        </div>

        <div className="rounded-2xl border border-white/70 bg-white/80 px-6 py-8 shadow-xl backdrop-blur-sm sm:px-10 sm:py-10">
          <p className="flex flex-wrap items-baseline justify-center gap-x-2 gap-y-4 text-lg text-zinc-700 sm:text-xl">
            <span>As a</span>
            <input
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
              placeholder="procurement manager"
              className="w-44 border-b-2 border-blue-400 bg-transparent px-1 text-center text-lg font-semibold text-zinc-900 outline-none transition-colors placeholder:font-normal placeholder:text-zinc-400 focus:border-blue-600 sm:w-56 sm:text-xl"
            />
            <span>, I am looking for</span>
            <input
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              placeholder="electronics components"
              className="w-44 border-b-2 border-blue-400 bg-transparent px-1 text-center text-lg font-semibold text-zinc-900 outline-none transition-colors placeholder:font-normal placeholder:text-zinc-400 focus:border-blue-600 sm:w-56 sm:text-xl"
            />
          </p>

          <div className="mt-6 flex justify-center">
            <Link
              href={
                canExplore
                  ? `/explore?userType=${encodeURIComponent(userType)}&product=${encodeURIComponent(product)}&optimize=cost`
                  : "#"
              }
              tabIndex={canExplore ? 0 : -1}
            >
              <button
                disabled={!canExplore}
                className="rounded-full bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Explore Suppliers &amp; Routes
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
