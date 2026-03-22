import { cn } from "@/lib/cn";

interface ProgressBarProps {
  value: number;
  className?: string;
}

export function ProgressBar({ value, className }: ProgressBarProps) {
  return (
    <div className={cn("h-2 w-full rounded-full bg-zinc-100", className)}>
      <div
        className="h-2 rounded-full bg-blue-500 transition-all"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}
