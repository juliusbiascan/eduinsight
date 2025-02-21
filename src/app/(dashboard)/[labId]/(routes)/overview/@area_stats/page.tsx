'use client';

import * as React from 'react';
import { TrendingUp } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { getUserActivity } from '@/data/get-user-activity';
import { useDateRange } from '@/hooks/use-date-range';
import { Skeleton } from '@/components/ui/skeleton';
import { calculateTrend } from '@/lib/utils/calculate-trend';

const chartConfig = {
  students: {
    label: 'Students',
    color: 'hsl(var(--chart-1))'
  },
  teacher: {
    label: 'Teacher',
    color: 'hsl(var(--chart-2))'
  }
} satisfies ChartConfig;

const formatDateRangeText = (dateRange: { from?: Date; to?: Date }) => {
  if (!dateRange.from || !dateRange.to) {
    return 'Overall lab usage patterns';
  }

  return `Usage patterns from ${dateRange.from.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  })} to ${dateRange.to.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  })}`;
};

const AreaStats = ({ params }: { params: { labId: string } }) => {
  const { dateRange } = useDateRange();
  const [chartData, setChartData] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await getUserActivity(params.labId, dateRange);
        setChartData(data);
      } catch (error) {
        console.error('Failed to fetch activity data:', error);
      }
      setIsLoading(false);
    };

    fetchData();
  }, [params.labId, dateRange]);

  const total = React.useMemo(
    () => ({
      students: chartData.reduce((acc, curr) => acc + (curr.students || 0), 0),
      teacher: chartData.reduce((acc, curr) => acc + (curr.teacher || 0), 0)
    }),
    [chartData]
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-[180px] mb-2" />
          <Skeleton className="h-4 w-[250px]" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-[310px] w-full relative">
              {/* Background grid skeleton */}
              <div className="absolute inset-0 grid grid-cols-6 gap-x-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="relative">
                    <Skeleton className="absolute bottom-0 w-full" 
                      style={{ 
                        height: `${Math.max(30, Math.random() * 100)}%`
                      }} 
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <div className="space-y-2 w-full">
            <Skeleton className="h-4 w-[280px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </CardFooter>
      </Card>
    );
  }

  const trend = chartData.length > 1 
    ? calculateTrend(
        chartData[chartData.length - 1].students + chartData[chartData.length - 1].teacher,
        chartData[0].students + chartData[0].teacher
      )
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lab Occupancy Trends</CardTitle>
        <CardDescription>
          {chartData.length === 0 ? (
            "No occupancy data available"
          ) : (
            formatDateRangeText(dateRange || { from: undefined, to: undefined })
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex h-[310px] items-center justify-center text-muted-foreground">
            No data available for the selected period
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="aspect-auto h-[310px] w-full">
            <AreaChart
              accessibilityLayer
              data={chartData}
              margin={{ left: 12, right: 12 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  });
                }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent 
                    indicator="dot"
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      });
                    }}
                  />
                }
              />
              <Area
                dataKey="teacher"
                type="natural"
                fill="var(--color-teacher)"
                fillOpacity={0.4}
                stroke="var(--color-teacher)"
                stackId="a"
              />
              <Area
                dataKey="students"
                type="natural"
                fill="var(--color-students)"
                fillOpacity={0.4}
                stroke="var(--color-students)"
                stackId="a"
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
      {chartData.length > 0 && (
        <CardFooter>
          <div className="flex w-full items-start gap-2 text-sm">
            <div className="grid gap-2">
              <div className="flex items-center gap-2 font-medium leading-none">
                {`${trend >= 0 ? '↑' : '↓'} ${Math.abs(trend)}% vs. start of period`}
                <TrendingUp className={`h-4 w-4 ${trend < 0 ? 'rotate-180' : ''}`} />
              </div>
              <div className="flex items-center gap-2 leading-none text-muted-foreground">
                Total lab visits: {(total.students + total.teacher).toLocaleString()}
              </div>
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default AreaStats;