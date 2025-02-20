'use client';

import * as React from 'react';
import { TrendingUp } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { getUserActivity } from '@/data/get-user-activity';
import { useDateRange } from '@/hooks/use-date-range';
import { Skeleton } from '@/components/ui/skeleton';

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
    return 'Showing total activity';
  }

  return `${dateRange.from.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  })} - ${dateRange.to.toLocaleDateString('en-US', { 
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
          <Skeleton className="h-6 w-[180px]" />
          <Skeleton className="h-4 w-[250px]" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[310px] w-full" />
        </CardContent>
        <CardFooter>
          <Skeleton className="h-4 w-[200px]" />
        </CardFooter>
      </Card>
    );
  }

  const trend = chartData.length > 1 
    ? ((chartData[chartData.length - 1].students + chartData[chartData.length - 1].teacher) -
       (chartData[0].students + chartData[0].teacher)) / (chartData[0].students + chartData[0].teacher) * 100
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Trends</CardTitle>
        <CardDescription>
          {formatDateRangeText(dateRange || { from: undefined, to: undefined })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[310px] w-full"
        >
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
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              {trend > 0 ? 'Trending up' : 'Trending down'} by {Math.abs(trend).toFixed(1)}%
              <TrendingUp className={`h-4 w-4 ${trend < 0 ? 'rotate-180' : ''}`} />
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              Total activity: {(total.students + total.teacher).toLocaleString()}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default AreaStats;