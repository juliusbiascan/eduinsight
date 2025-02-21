'use client';

import * as React from 'react';
import { TrendingUp } from 'lucide-react';
import { Label, Pie, PieChart } from 'recharts';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { getDeviceStats, getUniqueDevices } from '@/data/get-user-activity';
import { useDateRange } from '@/hooks/use-date-range';
import { Skeleton } from '@/components/ui/skeleton';
import { calculateTrend } from '@/lib/utils/calculate-trend';

// Generate random light colors with good contrast
const generateColor = () => {
  // Generate HSL color with:
  // - Random hue (0-360)
  // - High saturation (60-80%)
  // - High lightness (65-75%) for pastel/light colors
  const hue = Math.floor(Math.random() * 360);
  const saturation = Math.floor(Math.random() * 20 + 60);
  const lightness = Math.floor(Math.random() * 10 + 65);
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

const formatDateRangeText = (dateRange: { from?: Date; to?: Date }) => {
  if (!dateRange.from || !dateRange.to) {
    return 'Showing all time data';
  }
  return `${dateRange.from.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  })} - ${dateRange.to.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  })}`;
};

const PieStats = ({ params }: { params: { labId: string } }) => {
  const { dateRange } = useDateRange();
  const [chartData, setChartData] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [deviceColors, setDeviceColors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    const initializeDeviceColors = async () => {
      const devices = await getUniqueDevices();
      const colors = devices.reduce((acc, device) => {
        acc[device] = generateColor();
        return acc;
      }, {} as Record<string, string>);
      setDeviceColors(colors);
    };
    
    initializeDeviceColors();
  }, []);

  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await getDeviceStats(params.labId, dateRange);
        const enrichedData = data.map((item) => ({
          ...item,
          fill: deviceColors[item.devices] || '#666666',
          label: item.devices.charAt(0).toUpperCase() + item.devices.slice(1) // Capitalize device names
        }));
        setChartData(enrichedData);
      } catch (error) {
        console.error('Failed to fetch device stats:', error);
      }
      setIsLoading(false);
    };

    if (Object.keys(deviceColors).length > 0) {
      fetchData();
    }
  }, [params.labId, dateRange, deviceColors]);

  const totalVisitors = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.visitors, 0);
  }, [chartData]);

  // Add dynamic chart config generation
  const chartConfig = React.useMemo(() => {
    return chartData.reduce((acc, item) => {
      acc[item.devices] = {
        label: item.label,
        color: deviceColors[item.devices] || '#666666'
      };
      return acc;
    }, {
      visitors: {
        label: 'Visitors'
      }
    } as ChartConfig);
  }, [chartData, deviceColors]);

  // Replace existing loading return with this more detailed skeleton
  if (isLoading) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <Skeleton className="h-6 w-[200px] mb-2" />
          <Skeleton className="h-4 w-[300px]" />
        </CardHeader>
        <CardContent className="flex-1">
          <div className="mx-auto aspect-square max-h-[360px] relative">
            <Skeleton className="h-full w-full rounded-full" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
              <Skeleton className="h-8 w-[100px] mb-2" />
              <Skeleton className="h-4 w-[60px]" />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </CardFooter>
      </Card>
    );
  }

  const trend = chartData.length > 1 
    ? calculateTrend(
        totalVisitors,
        chartData.reduce((acc, curr) => acc + curr.visitors, 0) / chartData.length * chartData.length
      )
    : 0;

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Workstation Type Distribution</CardTitle>
        <CardDescription>
          {chartData.length === 0 ? (
            "No workstation data available"
          ) : (
            `Analysis of computer types in lab ${formatDateRangeText(dateRange || { from: undefined, to: undefined })}`
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {chartData.length === 0 ? (
          <div className="flex h-[360px] items-center justify-center text-muted-foreground">
            No data available for the selected period
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[360px]">
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const data = payload[0].payload;
                  return (
                    <div className="rounded-lg bg-background p-2 shadow-md">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-bold">{data.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {data.visitors.toLocaleString()} visitors
                        </span>
                      </div>
                    </div>
                  );
                }}
              />
              <Pie
                data={chartData}
                dataKey="visitors"
                nameKey="label"
                innerRadius={60}
                strokeWidth={5}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-3xl font-bold"
                          >
                            {totalVisitors.toLocaleString()}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground"
                          >
                            Visitors
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
      {chartData.length > 0 && (
        <CardFooter className="flex-col gap-2 text-sm">
          <div className="flex items-center gap-2 font-medium leading-none">
            {`${trend >= 0 ? '↑' : '↓'} ${Math.abs(trend)}% vs. previous period`}
            <TrendingUp className={`h-4 w-4 ${trend < 0 ? 'rotate-180' : ''}`} />
          </div>
          <div className="leading-none text-muted-foreground">
            {totalVisitors.toLocaleString()} total lab accesses recorded
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default PieStats;