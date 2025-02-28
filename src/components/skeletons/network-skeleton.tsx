import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const StatisticCardSkeleton = () => (
  <Card className="overflow-hidden">
    <CardHeader className='flex flex-row items-center justify-between space-y-0 p-3'>
      <div className="h-4 w-24 bg-muted rounded animate-pulse" />
      <div className="h-7 w-7 bg-muted/80 rounded-full animate-pulse" />
    </CardHeader>
    <CardContent className="p-3 pt-0">
      <div className='h-6 w-16 bg-muted rounded animate-pulse mb-2' />
      <div className='h-3 w-20 bg-muted/50 rounded animate-pulse' />
    </CardContent>
  </Card>
);

const ChartSkeleton = ({ height = "200px" }: { height?: string }) => (
  <Card className="p-4">
    <div className={`h-[${height}] bg-muted rounded-lg animate-pulse`} />
  </Card>
);

const TableSkeleton = () => (
  <Card>
    <CardHeader>
      <CardTitle className="h-6 w-32 bg-muted rounded animate-pulse" />
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="h-4 w-1/4 bg-muted rounded animate-pulse" />
            <div className="h-4 w-20 bg-muted/50 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export function NetworkSkeleton() {
  return (
    <div className='flex flex-1 flex-col space-y-4'>
      {/* Statistic Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, index) => (
          <StatisticCardSkeleton key={index} />
        ))}
      </div>

      {/* Network Activity */}
      <div className="space-y-4">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>

      {/* Query Analysis */}
      <div className="grid gap-4 md:grid-cols-2">
        <ChartSkeleton height="300px" />
        <ChartSkeleton height="300px" />
      </div>

      {/* Tables */}
      <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 md:gap-4">
        <TableSkeleton />
        <TableSkeleton />
      </div>

      <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 md:gap-4">
        <TableSkeleton />
        <TableSkeleton />
      </div>
    </div>
  );
}
