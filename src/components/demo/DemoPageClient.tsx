"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import {
  ArrowLeft,
  Calculator,
  MapPin,
  Package,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/formatters";

const DynamicVerifyMap = dynamic(() => import("./VerifySupplierMap").then((m) => m.VerifySupplierMap), {
  ssr: false,
  loading: () => <div className="h-[280px] animate-pulse rounded-xl bg-zinc-100" />,
});

const POOL_PEERS = [
  { id: "a", name: "Northshore Components", city: "Mississauga, ON", volume: "2.1 m³" },
  { id: "b", name: "Lakeside Retail Co-op", city: "Hamilton, ON", volume: "1.4 m³" },
  { id: "c", name: "Artisan Import Collective", city: "Oakville, ON", volume: "0.9 m³" },
];

const COMMUNITY_REVIEWS = [
  {
    id: "1",
    name: "Sarah K.",
    role: "Procurement · Toronto",
    rating: 5,
    text: "Shipments cleared in 4 days after we used the verified Monterrey lane. Community notes matched reality.",
  },
  {
    id: "2",
    name: "Marcus T.",
    role: "Ops lead · Vancouver",
    rating: 4,
    text: "Duty drawback estimate was within 8% of our broker. Helpful for SMB cash-flow planning.",
  },
  {
    id: "3",
    name: "Amélie D.",
    role: "Import specialist · Montréal",
    rating: 5,
    text: "The LCL pool saved us from paying for dead space—three of us split a consolidated container.",
  },
];

function StarRow({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${n} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < n ? "text-amber-400" : "text-zinc-200"}>
          ★
        </span>
      ))}
    </div>
  );
}

export function DemoPageClient() {
  const [importDutyPaid, setImportDutyPaid] = useState(4200);
  const [reExportShare, setReExportShare] = useState(40);

  const drawbackEstimate = useMemo(() => {
    const eligible = (importDutyPaid * reExportShare) / 100;
    return Math.round(eligible * 0.92);
  }, [importDutyPaid, reExportShare]);

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
          <Badge label="Concept demo" tone="info" />
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-12 px-4 py-10">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-blue-600">SMB prototype ideas</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">
            Risk, cash flow &amp; legitimacy
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-zinc-600">
            Small businesses care about <strong className="font-medium text-zinc-800">risk</strong>,{" "}
            <strong className="font-medium text-zinc-800">cash flow</strong>, and{" "}
            <strong className="font-medium text-zinc-800">legitimacy</strong>. Below are four directions AgentFish could
            visualize—mock data for stakeholder review.
          </p>
        </div>

        {/* 1 — Verify supplier */}
        <section className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-emerald-100 p-2 text-emerald-700">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-zinc-900">&ldquo;Verify Supplier&rdquo; map layer</h2>
              <p className="mt-1 text-sm text-zinc-600">
                Surface suppliers vetted by Canadian trade commissioners or with a proven shipment history—reduce fraud
                anxiety before you commit.
              </p>
            </div>
          </div>
          <Card className="p-5">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Badge label="Trade Commissioner network" tone="success" />
              <Badge label="Shipment history" tone="neutral" />
              <span className="text-xs text-zinc-500">Demo data · not live CBSA/TCC feeds</span>
            </div>
            <DynamicVerifyMap />
          </Card>
        </section>

        {/* 2 — LCL pooling */}
        <section className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-violet-100 p-2 text-violet-700">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-zinc-900">LCL (less-than-container) pooling</h2>
              <p className="mt-1 text-sm text-zinc-600">
                SMBs rarely fill a whole ship. Pool with other Canadian importers on the same lane to share cost and
                carbon.
              </p>
            </div>
          </div>
          <Card className="overflow-hidden p-0">
            <div className="border-b border-zinc-100 bg-gradient-to-r from-violet-50 to-sky-50 px-5 py-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-violet-700">Your region</p>
                  <p className="text-lg font-semibold text-zinc-900">Greater Toronto · Westbound Asia corridor</p>
                </div>
                <Badge label="3 peers pooling" tone="info" />
              </div>
            </div>
            <div className="space-y-3 p-5">
              <p className="text-sm text-zinc-700">
                <span className="font-semibold text-zinc-900">3 other local businesses</span> are consolidating
                shipments from this region this month. Pool freight and customs filings to improve unit economics.
              </p>
              <ul className="space-y-2">
                {POOL_PEERS.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-zinc-100 bg-zinc-50/80 px-3 py-2 text-sm"
                  >
                    <span className="flex items-center gap-2 font-medium text-zinc-800">
                      <Users className="h-4 w-4 text-zinc-400" />
                      {p.name}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {p.city} · {p.volume}
                    </span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className="w-full rounded-lg bg-violet-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-violet-700"
              >
                Request intro to pool · same origin window
              </button>
              <p className="text-center text-[11px] text-zinc-400">Illustrative CTA — no messages are sent in this demo.</p>
            </div>
          </Card>
        </section>

        {/* 3 — Duty drawback */}
        <section className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-amber-100 p-2 text-amber-800">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-zinc-900">Duty drawback calculator</h2>
              <p className="mt-1 text-sm text-zinc-600">
                Estimate duty you might recover if goods are later re-exported—helps cash-flow planning (not legal
                advice).
              </p>
            </div>
          </div>
          <Card className="p-5">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-4">
                <label className="block text-sm font-medium text-zinc-800">
                  Import duties paid (CAD)
                  <input
                    type="number"
                    min={0}
                    step={100}
                    value={importDutyPaid}
                    onChange={(e) => setImportDutyPaid(Number(e.target.value) || 0)}
                    className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
                  />
                </label>
                <label className="block text-sm font-medium text-zinc-800">
                  Share of goods re-exported (%)
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={reExportShare}
                    onChange={(e) => setReExportShare(Number(e.target.value))}
                    className="mt-2 w-full accent-amber-600"
                  />
                  <span className="text-xs text-zinc-500">{reExportShare}%</span>
                </label>
              </div>
              <div className="flex flex-col justify-center rounded-xl border border-amber-200/80 bg-amber-50/50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-amber-900/80">Illustrative recovery</p>
                <p className="mt-1 text-3xl font-semibold tabular-nums text-amber-950">{formatCurrency(drawbackEstimate)}</p>
                <p className="mt-2 text-xs leading-relaxed text-amber-900/70">
                  Simplified model: eligible portion × illustrative recovery rate. Real programs (e.g. drawback, duty
                  relief) depend on HS codes, timing, and CBSA rules.
                </p>
              </div>
            </div>
          </Card>
        </section>

        {/* 4 — Community rating */}
        <section className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-sky-100 p-2 text-sky-700">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-zinc-900">Community rating</h2>
              <p className="mt-1 text-sm text-zinc-600">
                Peer signal from other Canadian procurement managers—not generic &ldquo;ambassadors,&rdquo; but verified
                role context and lane-specific feedback.
              </p>
            </div>
          </div>
          <Card className="p-5">
            <div className="mb-4 flex items-center gap-2 text-sm text-zinc-700">
              <MapPin className="h-4 w-4 text-sky-600" />
              <span>
                Aggregate for <strong className="font-medium text-zinc-900">electronics · Mexico → Canada</strong> lane
              </span>
            </div>
            <ul className="space-y-4">
              {COMMUNITY_REVIEWS.map((r) => (
                <li key={r.id} className="rounded-lg border border-zinc-100 bg-zinc-50/80 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-zinc-900">{r.name}</p>
                      <p className="text-xs text-zinc-500">{r.role}</p>
                    </div>
                    <StarRow n={r.rating} />
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-700">&ldquo;{r.text}&rdquo;</p>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-center text-xs text-zinc-400">
              Mock personas · a production system would verify employers and aggregate by lane.
            </p>
          </Card>
        </section>

        <footer className="border-t border-zinc-200 pt-8 text-center text-sm text-zinc-500">
          <Link href="/" className="font-medium text-blue-600 hover:text-blue-800">
            Return to AgentFish home
          </Link>
        </footer>
      </main>
    </div>
  );
}
