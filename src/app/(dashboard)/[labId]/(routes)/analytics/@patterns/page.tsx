'use client';

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Clock, ListTree } from "lucide-react";
import { useTheme } from 'next-themes';
import { useDateRange } from '@/hooks/use-date-range';
import { getHourlyUsageStats, getUserActivityStats } from "@/data/analytics";
import { LineChart, PieChart as RePieChart, Pie, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Line, Cell } from 'recharts';
import { useEffect, useState } from "react";

interface UserActivityStats {
    name: string;
    activity: number;
}

interface HourlyUsage {
    hour: number;
    users: number;
    devices: number;
}

export default function PatternsAnalytics({ params }: { params: { labId: string } }) {
    const { theme } = useTheme();
    const { dateRange } = useDateRange();
    const [hourlyUsage, setHourlyUsage] = useState<HourlyUsage[]>([]);
    const [userActivityStats, setUserActivityStats] = useState<UserActivityStats[]>([]);

    const chartConfig = {
        style: {
            background: theme === 'dark' ? '#1A1617' : '#FFFFFF',
            color: theme === 'dark' ? '#FFFFFF' : '#1A1617',
        },
        grid: {
            stroke: theme === 'dark' ? '#333' : '#ddd',
        },
    };
    useEffect(() => {
        const fetchData = async () => {
            const [hourly, sessions] = await Promise.all([
                getHourlyUsageStats(params.labId, dateRange),
                getUserActivityStats(params.labId, dateRange)
            ]);
            setHourlyUsage(hourly);
            setUserActivityStats(sessions);
        };
        fetchData();
    }, [params.labId, dateRange]);

    const getRandomColor = (index: number) => {
        const colors = [
            '#FF9999', '#66B2B2', '#99C2FF', '#FFB366', '#99FF99',
            '#FF99CC', '#99CCFF', '#FFE5CC', '#B8E6B8', '#FFB3B3'
        ];
        return colors[index % colors.length];
    };

    return (
        <div className="grid gap-4 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Hourly Distribution</CardTitle>
                </CardHeader>
                <CardContent className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={hourlyUsage}>
                            <CartesianGrid strokeDasharray="3 3" stroke={chartConfig.grid.stroke} />
                            <XAxis
                                dataKey="hour"
                                stroke={chartConfig.style.color}
                                tick={{ fill: chartConfig.style.color, fontSize: 12 }}
                                tickFormatter={(hour) => `${hour}:00`}
                            />
                            <YAxis
                                stroke={chartConfig.style.color}
                                tick={{ fill: chartConfig.style.color, fontSize: 12 }}
                                label={{ position: 'insideLeft', value: 'Count', angle: -90 }}
                            />
                            <Tooltip
                                formatter={(value: number) => `${value}`}
                                labelFormatter={(hour) => `${hour}:00`}
                                contentStyle={{
                                    backgroundColor: chartConfig.style.background,
                                    border: `1px solid ${chartConfig.grid.stroke}`,
                                    borderRadius: '4px'
                                }}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="users"
                                stroke="#C9121F"
                                strokeWidth={2}
                                dot={{ fill: "#C9121F" }}
                            />
                            <Line
                                type="monotone"
                                dataKey="devices"
                                stroke="#2563EB"
                                strokeWidth={2}
                                dot={{ fill: "#2563EB" }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Session Types</CardTitle>
                </CardHeader>
                <CardContent className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <RePieChart>
                            <Pie
                                data={userActivityStats}
                                dataKey="activity"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={150}
                                label={(entry) => entry.name}
                            >
                                {userActivityStats.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={getRandomColor(index)}
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value: number) => `${value} sessions`}
                                contentStyle={{
                                    backgroundColor: chartConfig.style.background,
                                    border: `1px solid ${chartConfig.grid.stroke}`,
                                    borderRadius: '4px'
                                }}
                            />
                            <Legend />
                        </RePieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div >
    );
}
