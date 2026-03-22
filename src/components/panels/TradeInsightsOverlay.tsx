"use client";

import { ShieldCheck } from "lucide-react";
import { Toggle } from "@/components/ui/Toggle";

interface TradeInsightsOverlayProps {
  showTradeAdvantages: boolean;
  onChange: (value: boolean) => void;
}

export function TradeInsightsOverlay({ showTradeAdvantages, onChange }: TradeInsightsOverlayProps) {
  return (
    <div className="absolute right-4 top-4 z-[500] w-72 rounded-xl border border-zinc-200 bg-white/95 p-3 shadow-md backdrop-blur">
      <div className="mb-2 flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-blue-600" />
        <p className="text-sm font-semibold text-zinc-800">Trade Data Integration</p>
      </div>
      <p className="mb-3 text-xs text-zinc-600">Powered by Canadian trade + customs data</p>
      <Toggle checked={showTradeAdvantages} onChange={onChange} label="Show trade advantages" />
    </div>
  );
}
