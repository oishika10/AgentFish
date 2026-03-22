"use client";

import { Card } from "@/components/ui/Card";

export const SCENARIOS = ["Baseline", "Switch supplier country", "Tariffs +10%", "Tariffs -10%"] as const;
export type Scenario = (typeof SCENARIOS)[number];

interface ScenarioToggleProps {
  scenario: Scenario;
  onScenarioChange: (scenario: Scenario) => void;
}

export function ScenarioToggle({ scenario, onScenarioChange }: ScenarioToggleProps) {
  return (
    <Card className="p-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Scenario</p>
      <div className="flex flex-wrap gap-2">
        {SCENARIOS.map((s) => (
          <button
            key={s}
            onClick={() => onScenarioChange(s)}
            className={`rounded-full border px-3 py-1 text-xs transition-colors ${
              scenario === s
                ? "border-blue-300 bg-blue-50 text-blue-700"
                : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
            }`}
            type="button"
          >
            {s}
          </button>
        ))}
      </div>
    </Card>
  );
}
