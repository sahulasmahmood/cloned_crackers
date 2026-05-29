import { TableCell, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface TableSkeletonProps {
  /** Number of placeholder rows to render */
  rows?: number;
  /** Total number of columns in the table */
  columns: number;
  /** 0-based column indexes that should render an image/avatar square */
  imageColumns?: number[];
  /** Whether the last column is an actions column (renders icon placeholders) */
  hasActionsColumn?: boolean;
}

/**
 * Renders placeholder rows for a data table while it loads.
 * Mirrors the real row layout (image squares, an actions column) so the
 * table feels instant and there's no layout shift when data arrives.
 *
 * Must be rendered inside a <TableBody>.
 */
export function TableSkeleton({
  rows = 8,
  columns,
  imageColumns = [],
  hasActionsColumn = true,
}: TableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <TableRow key={rowIndex}>
          {Array.from({ length: columns }).map((_, colIndex) => {
            const isLastColumn = colIndex === columns - 1;

            if (imageColumns.includes(colIndex)) {
              return (
                <TableCell key={colIndex}>
                  <Skeleton className="h-10 w-10 rounded-md" />
                </TableCell>
              );
            }

            if (isLastColumn && hasActionsColumn) {
              // Actions column — small right-aligned icon placeholders
              return (
                <TableCell key={colIndex} className="text-right">
                  <div className="flex justify-end gap-2">
                    <Skeleton className="h-7 w-7 rounded-md" />
                    <Skeleton className="h-7 w-7 rounded-md" />
                  </div>
                </TableCell>
              );
            }

            return (
              <TableCell key={colIndex}>
                <Skeleton className="h-4 w-3/4" />
              </TableCell>
            );
          })}
        </TableRow>
      ))}
    </>
  );
}
