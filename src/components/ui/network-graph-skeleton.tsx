import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function NetworkGraphSkeleton() {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Total queries over last 24 hours</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <Skeleton className="w-full h-full" />
        </div>
        <div className="flex justify-center gap-6 mt-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="w-3 h-3" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
