"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";

interface SmartInputProps {
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  placeholder: string;
}

export function SmartInput({ value, onChange, suggestions, placeholder }: SmartInputProps) {
  const [focused, setFocused] = useState(false);
  const filtered = useMemo(() => {
    const term = value.toLowerCase().trim();
    if (!term) {
      return suggestions.slice(0, 4);
    }
    return suggestions.filter((item) => item.toLowerCase().includes(term)).slice(0, 4);
  }, [suggestions, value]);

  return (
    <div className="relative">
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 100)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
      />
      {focused && filtered.length ? (
        <div className="absolute z-20 mt-1 w-full rounded-lg border border-zinc-200 bg-white p-1 shadow-md">
          {filtered.map((item) => (
            <button
              key={item}
              className={cn(
                "w-full rounded-md px-2 py-1.5 text-left text-sm text-zinc-700 hover:bg-zinc-100",
                item === value && "bg-zinc-100",
              )}
              onMouseDown={() => onChange(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
