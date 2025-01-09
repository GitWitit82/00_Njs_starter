import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

/**
 * Skeleton loader for form template list
 */
export function FormTemplateListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i} className="p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex space-x-2">
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-20" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

/**
 * Skeleton loader for form builder
 */
export function FormBuilderSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="p-4 rounded-t-lg bg-slate-100">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-[300px]" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-[200px]" />
            <Skeleton className="h-10 w-[200px]" />
            <Skeleton className="h-10 w-[200px]" />
          </div>
        </div>
      </div>

      {/* Description Skeleton */}
      <div className="border rounded-lg p-4">
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-24 w-full" />
      </div>

      {/* Form Type Skeleton */}
      <div className="border rounded-lg p-4">
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-10 w-[200px]" />
      </div>

      {/* Sections Skeleton */}
      {Array.from({ length: 2 }).map((_, index) => (
        <div key={index} className="border rounded-lg">
          <div className="bg-slate-100 p-4 rounded-t-lg">
            <div className="flex justify-between items-center">
              <Skeleton className="h-8 w-[200px]" />
              <Skeleton className="h-10 w-[100px]" />
            </div>
          </div>
          <div className="p-4 space-y-4">
            {Array.from({ length: 3 }).map((_, itemIndex) => (
              <div key={itemIndex} className="flex items-center gap-4">
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-[100px]" />
              </div>
            ))}
            <Skeleton className="h-10 w-[150px] mt-4" />
          </div>
        </div>
      ))}

      {/* Actions Skeleton */}
      <div className="flex justify-between">
        <Skeleton className="h-10 w-[150px]" />
        <Skeleton className="h-10 w-[150px]" />
      </div>
    </div>
  )
}

/**
 * Skeleton loader for form instance view
 */
export function FormInstanceSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-6 w-40" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

/**
 * Skeleton loader for form status timeline
 */
export function FormStatusTimelineSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-start space-x-4">
          <Skeleton className="h-6 w-6 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      ))}
    </div>
  )
} 