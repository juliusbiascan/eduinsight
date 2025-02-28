"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { UpstreamServersResponse } from "@/lib/pihole";

interface Props {
    data: UpstreamServersResponse;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-white/95 p-4 rounded-lg shadow-md border-border border">
                <p className="text-sm text-muted-foreground">
                    {data.name}: {data.value.toLocaleString()}
                </p>
            </div>
        );
    }
    return null;
};

export const UpstreamServersPie = ({ data }: Props) => {
    const chartData = data.upstreams.map(server => ({
        name: server.name || server.ip || 'Unknown',
        value: server.count
    }));

    return (
        <Card>
            <CardHeader>
                <CardTitle>Upstream Servers</CardTitle>
                <CardDescription>Distribution of DNS queries among different upstream DNS servers</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] sm:h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            innerRadius={60}
                            dataKey="value"
                        >
                            {chartData.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend layout="vertical" align="right" verticalAlign="middle" />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};
