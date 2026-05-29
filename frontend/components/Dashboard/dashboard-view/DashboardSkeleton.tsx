import { Skeleton } from "@/components/ui/skeleton";

/**
 * Layout-matching skeleton shown while dashboard data loads.
 * Mirrors the real dashboard grid so the page feels instant instead of
 * showing a single centered spinner.
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading dashboard">
      {/* KPI Cards row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-3"
          >
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>

      {/* Leads + Licenses row */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        <div className="lg:col-span-4 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-48 w-full" />
        </div>
        <div className="lg:col-span-3 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>

      {/* 3-column section grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4"
          >
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-40 w-full" />
          </div>
        ))}
      </div>

      {/* Top products full width */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-32 w-full" />
      </div>

      {/* Finance / Warehouse / EOD row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4"
          >
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-36 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
