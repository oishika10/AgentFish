import { cn } from "@/lib/cn";

interface BadgeProps {
  label: string;
  tone?: "neutral" | "success" | "info" | "warning";
  className?: string;
}

export function Badge({ label, tone = "neutral", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        tone === "neutral" && "bg-zinc-100 text-zinc-700",
        tone === "success" && "bg-emerald-100 text-emerald-700",
        tone === "info" && "bg-blue-100 text-blue-700",
        tone === "warning" && "bg-amber-100 text-amber-700",
        className,
      )}
    >
      {label}
    </span>
  );
}
