"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

interface QueryTypesPieProps {
  data: {
    types: {
      [key: string]: number;
    };
  }
}

const COLORS = [
  '#10b981', '#2563eb', '#dc2626', '#9333ea',
  '#0891b2', '#ca8a04', '#be185d', '#059669',
  '#f97316', '#8b5cf6', '#ec4899', '#14b8a6',
  '#f59e0b', '#6366f1', '#ef4444', '#84cc16'
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white/95 p-4 rounded-lg shadow-md border-border border">
        <p className="text-sm text-muted-foreground">
          {data.name}: {data.value.toLocaleString()} ({data.percentage.toFixed(1)}%)
        </p>
      </div>
    );
  }
  return null;
};

export function QueryTypesPie({ data }: QueryTypesPieProps) {
  const total = Object.values(data.types).reduce((sum, value) => sum + value, 0);
  const pieData = Object.entries(data.types)
    .filter(([_, value]) => value > 0) // Filter out zero values
    .map(([name, value]) => ({
      name,
      value,
      percentage: (value / total) * 100
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Query Types</CardTitle>
      </CardHeader>
      <CardContent className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={130}
              label={false}
            >
              {pieData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend layout="vertical" align="right" verticalAlign="middle" />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
