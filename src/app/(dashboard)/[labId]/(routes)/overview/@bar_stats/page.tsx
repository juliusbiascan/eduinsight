'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { getUserActivity } from '@/data/get-user-activity';
import { useDateRange } from '@/hooks/use-date-range';
import { Skeleton } from '@/components/ui/skeleton';

const chartConfig = {
  students: {
    label: 'Students',
    color: 'hsl(var(--chart-2))'
  },
  teacher: {
    label: 'Teachers',
    color: 'hsl(var(--chart-1))'
  },
} satisfies ChartConfig;

const formatDateRangeText = (dateRange: { from?: Date; to?: Date }) => {
  if (!dateRange.from || !dateRange.to) {
    return 'Showing total visitors';
  }

  const diffInDays = Math.ceil(
    (dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffInDays <= 1) {
    return "Showing today's visitors";
  }
  if (diffInDays <= 7) {
    return "Showing this week's visitors";
  }
  if (diffInDays <= 30) {
    return "Showing this month's visitors";
  }
  if (diffInDays <= 90) {
    return "Showing this quarter's visitors";
  }
  
  return `Showing visitors from ${dateRange.from.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  })} to ${dateRange.to.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  })}`;
};

const BarStats = ({ params }: { params: { labId: string } }) => {
  const { dateRange } = useDateRange();
  const [chartData, setChartData] = React.useState<any[]>([]);
  const [activeChart, setActiveChart] = React.useState<keyof typeof chartConfig>('students');
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
    return <Card>
      <CardHeader className='flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row'>
        <div className='flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6'>
          <Skeleton className='h-6 w-[180px]' />
          <Skeleton className='h-4 w-[250px]' />
        </div>
        <div className='flex'>
          {[1, 2].map((i) => (
            <div
              key={i}
              className='relative flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-l sm:border-t-0 sm:px-8 sm:py-6'
            >
              <Skeleton className='h-3 w-[80px]' />
              <Skeleton className='h-8 w-[100px] sm:h-10' />
            </div>
          ))}
        </div>
      </CardHeader>
      <CardContent className='px-2 sm:p-6'>
        {/* Bar-like shapes */}
        <div className='flex aspect-auto h-[280px] w-full items-end justify-around gap-2 pt-8'>
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton
              key={i}
              className='w-full'
              style={{
                height: `${Math.max(20, Math.random() * 100)}%`
              }}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  }

  return (
    <Card>
      <CardHeader className='flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row'>
        <div className='flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6'>
          <CardTitle>Overview</CardTitle>
          <CardDescription>
            {formatDateRangeText(dateRange || { from: undefined, to: undefined })}
          </CardDescription>
        </div>
        <div className='flex'>
          {['students', 'teacher'].map((key) => {
            const chart = key as keyof typeof chartConfig;
            if (!chart || total[key as keyof typeof total] === 0) return null;
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className='relative flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6'
                onClick={() => setActiveChart(chart)}
              >
                <span className='text-xs text-muted-foreground'>
                  {chartConfig[chart].label}
                </span>
                <span className='text-lg font-bold leading-none sm:text-3xl'>
                  {total[key as keyof typeof total]?.toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className='px-2 sm:p-6'>
        <ChartContainer
          config={chartConfig}
          className='aspect-auto h-[280px] w-full'
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey='date'
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
              content={
                <ChartTooltipContent
                  className='w-[150px]'
                  nameKey={activeChart}
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
            <Bar dataKey={activeChart} fill={chartConfig[activeChart].color} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export default BarStats;