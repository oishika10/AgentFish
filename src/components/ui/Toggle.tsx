"use client";

import { cn } from "@/lib/cn";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

export function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-2 py-1 text-xs",
        checked ? "border-blue-300 bg-blue-50 text-blue-700" : "border-zinc-300 bg-white text-zinc-600",
      )}
    >
      <span
        className={cn(
          "h-5 w-9 rounded-full p-0.5 transition-colors",
          checked ? "bg-blue-500" : "bg-zinc-300",
        )}
      >
        <span
          className={cn(
            "block h-4 w-4 rounded-full bg-white transition-transform",
            checked ? "translate-x-4" : "translate-x-0",
          )}
        />
      </span>
      {label ? <span>{label}</span> : null}
    </button>
  );
}
