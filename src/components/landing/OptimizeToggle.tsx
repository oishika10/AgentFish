"use client";

import { OptimizeFor } from "@/types";
import { cn } from "@/lib/cn";

interface OptimizeToggleProps {
  value: OptimizeFor;
  onChange: (value: OptimizeFor) => void;
}

const options: { id: OptimizeFor; label: string }[] = [
  { id: "cost", label: "Cost" },
  { id: "speed", label: "Speed" },
  { id: "sustainability", label: "Sustainability" },
  { id: "compliance", label: "Compliance" },
];

export function OptimizeToggle({ value, onChange }: OptimizeToggleProps) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          className={cn(
            "rounded-full border px-3 py-2 text-sm transition-colors",
            value === option.id
              ? "border-blue-300 bg-blue-50 font-medium text-blue-700"
              : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
