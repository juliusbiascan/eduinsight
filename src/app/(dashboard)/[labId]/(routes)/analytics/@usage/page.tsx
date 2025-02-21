'use client';

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart2, Users } from "lucide-react";
import { useTheme } from 'next-themes';
import { useDateRange } from '@/hooks/use-date-range';
import { getDeviceUsageStats, getUserActivityStats } from "@/data/analytics";
import { BarChart, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Bar, Cell, Area } from 'recharts';
import { useEffect, useState } from "react";
interface DeviceUsageStats {
    name: string;
    usage: number;
}

interface UserActivityStats {
    name: string;
    activity: number;
}

export default function UsageAnalytics({ params }: { params: { labId: string } }) {
    const { theme } = useTheme();
    const { dateRange } = useDateRange();
    const [deviceUsageStats, setDeviceUsageStats] = useState<DeviceUsageStats[]>([]);
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

    const getRandomColor = (index: number) => {
        const colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD',
            '#D4A5A5', '#9B6B6B', '#CE97B0', '#AFC1D6', '#92A8D1'
        ];
        return colors[index % colors.length];
    };

    const yAxisLabelStyle = {
        position: 'insideLeft',
        angle: -90,
        fill: theme === 'dark' ? '#FFFFFF' : '#1A1617',
        fontSize: 12,
    };

    useEffect(() => {
        const fetchData = async () => {
            const [devices, users] = await Promise.all([
                getDeviceUsageStats(params.labId, dateRange),
                getUserActivityStats(params.labId, dateRange)
            ]);
            setDeviceUsageStats(devices);
            setUserActivityStats(users);
        };
        fetchData();
    }, [params.labId, dateRange]);

    return (
        <div className="grid gap-4 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart2 className="h-4 w-4" />
                        Device Usage
                    </CardTitle>
                </CardHeader>
                <CardContent className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={deviceUsageStats}>
                            <CartesianGrid strokeDasharray="3 3" stroke={chartConfig.grid.stroke} />
                            <XAxis
                                dataKey="name"
                                stroke={chartConfig.style.color}
                                tick={{ fill: chartConfig.style.color, fontSize: 12 }}
                            />
                            <YAxis
                                stroke={chartConfig.style.color}
                                tick={{ fill: chartConfig.style.color, fontSize: 12 }}
                                label={{ ...yAxisLabelStyle, value: 'Usage Count' }}
                            />
                            <Tooltip
                                formatter={(value: number) => `${value} uses`}
                                contentStyle={{
                                    backgroundColor: chartConfig.style.background,
                                    border: `1px solid ${chartConfig.grid.stroke}`,
                                    borderRadius: '4px'
                                }}
                            />
                            <Legend />
                            <Bar dataKey="usage" fill="#C9121F">
                                {deviceUsageStats.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={getRandomColor(index)} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        User Activity
                    </CardTitle>
                </CardHeader>
                <CardContent className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={userActivityStats}>
                            <defs>
                                <linearGradient id="userActivityGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#C9121F" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#C9121F" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke={chartConfig.grid.stroke} />
                            <XAxis
                                dataKey="name"
                                stroke={chartConfig.style.color}
                                tick={{ fill: chartConfig.style.color, fontSize: 12 }}
                            />
                            <YAxis
                                stroke={chartConfig.style.color}
                                tick={{ fill: chartConfig.style.color, fontSize: 12 }}
                                label={{ ...yAxisLabelStyle, value: 'Activity Level' }}
                            />
                            <Tooltip
                                formatter={(value: number) => `${value} actions`}
                                contentStyle={{
                                    backgroundColor: chartConfig.style.background,
                                    border: `1px solid ${chartConfig.grid.stroke}`,
                                    borderRadius: '4px'
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="activity"
                                stroke="#C9121F"
                                fillOpacity={1}
                                fill="url(#userActivityGradient)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}
