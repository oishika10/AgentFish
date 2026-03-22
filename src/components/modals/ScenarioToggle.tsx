"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";

const scenarios = ["Baseline", "Switch supplier country", "Tariffs +10%", "Tariffs -10%"] as const;

export function ScenarioToggle() {
  const [active, setActive] = useState<(typeof scenarios)[number]>("Baseline");

  return (
    <Card className="p-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Scenario</p>
      <div className="flex flex-wrap gap-2">
        {scenarios.map((scenario) => (
          <button
            key={scenario}
            onClick={() => setActive(scenario)}
            className={`rounded-full border px-3 py-1 text-xs transition-colors ${
              active === scenario
                ? "border-blue-300 bg-blue-50 text-blue-700"
                : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
            }`}
            type="button"
          >
            {scenario}
          </button>
        ))}
      </div>
    </Card>
  );
}
