import { Skeleton } from "@/components/ui/skeleton";

// Generic table skeleton lives in the shared ui folder; re-exported here so the
// product list components can keep importing it from one place.
export { TableSkeleton } from "@/components/ui/table-skeleton";

/**
 * Placeholder cards for the mobile (card) view of a product list.
 */
export function MobileCardSkeleton({ count = 5 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border rounded-lg p-3 bg-card">
          <div className="flex gap-3">
            <Skeleton className="size-20 sm:size-24 rounded-md flex-shrink-0" />
            <div className="flex-1 space-y-2 py-1">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-3 w-1/2" />
              <div className="flex gap-2 pt-1">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-12 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
