'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useTheme } from 'next-themes';
import { useDateRange } from '@/hooks/use-date-range';
import { getResourceUtilization } from "@/data/analytics";
import { AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Area } from 'recharts';
import { useEffect, useState } from "react";

interface ResourceUtilization {
    timestamp: string;
    cpu: number;
    memory: number | null;
    network: number;
}

export default function PerformanceAnalytics({ params }: { params: { labId: string } }) {
    const { theme } = useTheme();
    const { dateRange } = useDateRange();
    const [resourceUtilization, setResourceUtilization] = useState<ResourceUtilization[]>([]);


    const resourceColors = {
        cpu: { stroke: '#8884d8', fill: '#8884d833' },
        memory: { stroke: '#82ca9d', fill: '#82ca9d33' },
        network: { stroke: '#ffc658', fill: '#ffc65833' }
    };

    const chartConfig = {
        style: {
            background: theme === 'dark' ? '#1A1617' : '#FFFFFF',
            color: theme === 'dark' ? '#FFFFFF' : '#1A1617',
        },
        grid: {
            stroke: theme === 'dark' ? '#333' : '#ddd',
        },
    };
    const formatResourceValue = (value: number) => `${value.toFixed(1)}%`;
    const formatTimestamp = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString();
    };
    useEffect(() => {
        const fetchData = async () => {
            const data = await getResourceUtilization(params.labId, dateRange);
            setResourceUtilization(data);
        };
        fetchData();
    }, [params.labId, dateRange]);

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>System Resources</CardTitle>
                    <CardDescription>Real-time resource utilization</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={resourceUtilization}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke={chartConfig.grid.stroke} />
                            <XAxis
                                dataKey="timestamp"
                                tickFormatter={formatTimestamp}
                                stroke={chartConfig.style.color}
                                tick={{ fill: chartConfig.style.color, fontSize: 12 }}
                            />
                            <YAxis
                                stroke={chartConfig.style.color}
                                tick={{ fill: chartConfig.style.color, fontSize: 12 }}
                                domain={[0, 100]}
                                tickFormatter={(value) => `${value}%`}
                            />
                            <Tooltip
                                formatter={formatResourceValue}
                                labelFormatter={formatTimestamp}
                                contentStyle={{
                                    backgroundColor: chartConfig.style.background,
                                    border: `1px solid ${chartConfig.grid.stroke}`,
                                    borderRadius: '4px'
                                }}
                            />
                            <Legend />
                            {Object.entries(resourceColors).map(([key, color]) => (
                                <Area
                                    key={key}
                                    type="monotone"
                                    dataKey={key}
                                    stroke={color.stroke}
                                    fill={color.fill}
                                    strokeWidth={2}
                                    dot={false}
                                    activeDot={{ r: 4 }}
                                />
                            ))}
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}
