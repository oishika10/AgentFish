"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";

const DynamicLandingMap = dynamic(
  () => import("@/components/landing/LandingMap").then((mod) => mod.LandingMap),
  { ssr: false },
);

export function HeroSection() {
  const [userType, setUserType] = useState("");
  const [product, setProduct] = useState("");

  const canExplore = userType.trim().length > 0 && product.trim().length > 0;

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#f7f8fa]">
      {/* Map background — label-free, muted, interactive */}
      <div className="absolute inset-0 z-0 opacity-40">
        <DynamicLandingMap />
      </div>

      {/* Content — pointer-events pass through to the map */}
      <div className="pointer-events-none relative z-[2] flex min-h-screen flex-col items-center justify-center px-4">


        {/* Prompt card */}
        <div className="pointer-events-auto w-full max-w-2xl">
          <div className="rounded-2xl border border-zinc-200/80 bg-white px-5 py-4 shadow-[0_2px_20px_rgba(0,0,0,0.06)] sm:px-6 sm:py-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-3">
              <div className="flex flex-1 items-center gap-2 text-[15px] text-zinc-500">
                <span className="shrink-0">As a</span>
                <input
                  value={userType}
                  onChange={(e) => setUserType(e.target.value)}
                  placeholder="procurement manager"
                  className="min-w-0 flex-1 bg-transparent text-[15px] text-zinc-900 outline-none placeholder:text-zinc-300"
                />
              </div>

              <div className="hidden h-5 w-px bg-zinc-200 sm:block" />

              <div className="flex flex-1 items-center gap-2 text-[15px] text-zinc-500">
                <span className="shrink-0">I need</span>
                <input
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                  placeholder="electronics components"
                  className="min-w-0 flex-1 bg-transparent text-[15px] text-zinc-900 outline-none placeholder:text-zinc-300"
                />
              </div>

              <Link
                href={
                  canExplore
                    ? `/explore?userType=${encodeURIComponent(userType)}&product=${encodeURIComponent(product)}&optimize=cost`
                    : "#"
                }
                tabIndex={canExplore ? 0 : -1}
                className="shrink-0"
              >
                <button
                  disabled={!canExplore}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-white transition-colors hover:bg-zinc-800 disabled:opacity-25"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
            </div>
          </div>

          <p className="mt-4 text-center text-[13px] text-zinc-400">
            Discover suppliers, compare routes, and uncover trade agreement savings.
          </p>
        </div>
      </div>
    </section>
  );
}
