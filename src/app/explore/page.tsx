import { Suspense } from "react";
import { ExploreShell } from "@/components/explore/ExploreShell";

export default function ExplorePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-zinc-50 text-sm text-zinc-600">
          Loading explore…
        </div>
      }
    >
      <ExploreShell />
    </Suspense>
  );
}
