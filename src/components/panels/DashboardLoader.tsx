"use client";

import { motion } from "framer-motion";
import { LayoutDashboard } from "lucide-react";

const BAR_COUNT = 7;

export function DashboardLoader() {
  return (
    <div
      className="rounded-xl border border-violet-200/90 bg-gradient-to-br from-violet-50/90 via-white to-sky-50/80 p-4 shadow-sm"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="mb-4 flex items-center justify-center gap-2 text-violet-800">
        <LayoutDashboard className="h-4 w-4 shrink-0" aria-hidden />
        <span className="text-xs font-semibold uppercase tracking-wide">Building analytics dashboard</span>
      </div>
      <div className="flex h-14 items-end justify-center gap-1.5 px-2">
        {Array.from({ length: BAR_COUNT }, (_, index) => (
          <motion.div
            key={index}
            className="w-2 rounded-sm bg-gradient-to-t from-violet-600 to-violet-400"
            style={{ height: 40, transformOrigin: "bottom" }}
            animate={{ scaleY: [0.2, 1, 0.35, 0.88, 0.2] }}
            transition={{
              duration: 1.25,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: index * 0.09,
            }}
          />
        ))}
      </div>
      <p className="mt-3 text-center text-[11px] text-zinc-500">Synthesizing market signals…</p>
    </div>
  );
}
