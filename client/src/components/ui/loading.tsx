import { Skeleton } from "@/components/ui/skeleton";

export function ProductLoading() {
  return (
    <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8">
      {/* Gallery Skeleton */}
      <div className="aspect-square rounded-xl bg-gray-100">
        <Skeleton className="h-full w-full rounded-xl" />
      </div>

      {/* Product Info Skeleton */}
      <div className="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0">
        <div className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Skeleton className="h-8 w-3/4" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>

          {/* Price */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-baseline gap-2">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-10 w-40" />
            </div>
          </div>

          {/* Variants */}
          <div className="space-y-6 py-2">
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-lg" />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <div className="grid grid-cols-6 gap-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-10 w-full rounded-md" />
                ))}
              </div>
            </div>

            <Skeleton className="h-4 w-40" />
          </div>

          {/* Quantity */}
          <div className="flex items-center">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-32 ml-4" />
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <Skeleton className="h-12 flex-1 rounded-md" />
            <Skeleton className="h-12 flex-1 rounded-md" />
          </div>

          {/* Additional Info */}
          <div className="border-t pt-6 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
