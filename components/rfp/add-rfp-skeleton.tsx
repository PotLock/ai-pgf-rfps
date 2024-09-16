import { Skeleton } from "@/components/ui/skeleton"

export const AddRfpSkeleton = () => {
    return (
        <div className="flex flex-col space-y-3">
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    )
}
