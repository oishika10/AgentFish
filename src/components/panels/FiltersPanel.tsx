"use client";

import { Card } from "@/components/ui/Card";
import { Toggle } from "@/components/ui/Toggle";

interface FiltersPanelProps {
  onlyTradeRoutes: boolean;
  onOnlyTradeRoutesChange: (value: boolean) => void;
  minimizeImportTax: boolean;
  onMinimizeImportTaxChange: (value: boolean) => void;
}

export function FiltersPanel({
  onlyTradeRoutes,
  onOnlyTradeRoutesChange,
  minimizeImportTax,
  onMinimizeImportTaxChange,
}: FiltersPanelProps) {
  return (
    <div className="space-y-3">
      <Card className="p-4">
        <p className="mb-3 text-sm font-semibold text-zinc-800">Supplier Filters</p>
        <div className="space-y-3 text-sm text-zinc-700">
          <label className="block">
            Country
            <select className="mt-1 w-full rounded-lg border border-zinc-200 px-2 py-1.5 text-sm">
              <option>All countries</option>
              <option>Mexico</option>
              <option>Vietnam</option>
              <option>Germany</option>
              <option>South Korea</option>
            </select>
          </label>
          <label className="block">
            Price range
            <input type="range" min={10000} max={60000} className="mt-1 w-full" />
          </label>
        </div>
      </Card>

      <Card className="p-4">
        <p className="mb-3 text-sm font-semibold text-zinc-800">Logistics Filters</p>
        <div className="space-y-3 text-sm text-zinc-700">
          <label className="block">
            Max delivery time
            <input type="range" min={12} max={500} className="mt-1 w-full" />
          </label>
          <label className="block">
            Max landed cost
            <input type="range" min={4000} max={22000} className="mt-1 w-full" />
          </label>
          <div className="flex flex-wrap gap-2">
            {["Truck", "Rail", "Ship", "Air"].map((mode) => (
              <span key={mode} className="rounded-full border border-zinc-200 px-2 py-1 text-xs">
                {mode}
              </span>
            ))}
          </div>
        </div>
      </Card>

      <Card className="space-y-3 p-4">
        <p className="text-sm font-semibold text-zinc-800">Trade Filters</p>
        <Toggle checked={onlyTradeRoutes} onChange={onOnlyTradeRoutesChange} label="Only show trade agreement benefits" />
        <Toggle checked={minimizeImportTax} onChange={onMinimizeImportTaxChange} label="Minimize import tax" />
      </Card>
    </div>
  );
}
