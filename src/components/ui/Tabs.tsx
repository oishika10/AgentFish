"use client";

import { cn } from "@/lib/cn";

export interface TabItem {
  id: string;
  label: string;
}

interface TabsProps {
  items: TabItem[];
  active: string;
  onChange: (id: string) => void;
}

export function Tabs({ items, active, onChange }: TabsProps) {
  return (
    <div className="grid grid-cols-3 gap-1 rounded-lg bg-zinc-100 p-1">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onChange(item.id)}
          className={cn(
            "rounded-md px-2 py-1.5 text-sm font-medium transition-colors",
            active === item.id ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-600 hover:text-zinc-900",
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
