"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Truck, Ship, Train, Plane, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EnrichedRoute } from "@/lib/costCalculator";
import { formatHours } from "@/lib/formatters";

interface RouteTimelineModalProps {
  open: boolean;
  onClose: () => void;
  route: EnrichedRoute | null;
}

const modeIcon = {
  truck: Truck,
  ship: Ship,
  rail: Train,
  air: Plane,
};

export function RouteTimelineModal({ open, onClose, route }: RouteTimelineModalProps) {
  return (
    <AnimatePresence>
      {open && route ? (
        <motion.div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-zinc-900/40 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="w-full max-w-4xl"
          >
            <Card className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-zinc-900">Route Timeline</h3>
                  <p className="text-sm text-zinc-600">
                    {route.supplier.name} to {route.destinationLabel}
                  </p>
                </div>
                <Button variant="ghost" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="overflow-x-auto pb-2">
                <div className="flex min-w-[760px] items-center gap-3">
                  {route.segments.map((segment, index) => {
                    const Icon = modeIcon[segment.mode];
                    return (
                      <div key={segment.id} className="flex items-center gap-3">
                        <div className="min-w-40 rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                          <div className="mb-1 inline-flex rounded-full bg-white p-2 shadow-sm">
                            <Icon className="h-4 w-4 text-zinc-700" />
                          </div>
                          <p className="text-xs font-medium text-zinc-800">
                            {segment.from} to {segment.to}
                          </p>
                          <p className="text-xs text-zinc-500">{formatHours(segment.durationHours)}</p>
                        </div>
                        {index < route.segments.length - 1 ? <div className="h-0.5 w-10 bg-zinc-300" /> : null}
                      </div>
                    );
                  })}
                </div>
              </div>
              <p className="mt-4 text-sm font-medium text-zinc-700">Total travel time: {formatHours(route.totalDurationHours)}</p>
            </Card>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
