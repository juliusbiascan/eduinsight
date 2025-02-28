import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function QueryTypesSkeleton() {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Query Types</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-between items-center">
        <Skeleton className="h-[300px] w-[300px] rounded-full" />
        <div className="grid grid-cols-2 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="w-3 h-3" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
