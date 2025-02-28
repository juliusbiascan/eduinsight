"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

interface NetworkGraphProps {
  data: {
    timestamp: string
    total: number
    cached: number
    blocked: number
    forwarded: number
  }[]
}

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const other = data.total - (data.forwarded + data.cached + data.blocked);
    const total = data.total;
    
    return (
      <div className="bg-white/95 p-4 rounded-lg shadow-md border-border border">
        <p className="font-medium mb-2 text-sm">
          {formatTime(label)}
        </p>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#10b981]" />
            <span className="text-sm text-muted-foreground">
              Forwarded: {data.forwarded} ({((data.forwarded / total) * 100).toFixed(1)}%)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#2563eb]" />
            <span className="text-sm text-muted-foreground">
              Cached: {data.cached} ({((data.cached / total) * 100).toFixed(1)}%)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#dc2626]" />
            <span className="text-sm text-muted-foreground">
              Blocked: {data.blocked} ({((data.blocked / total) * 100).toFixed(1)}%)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-gray-400" />
            <span className="text-sm text-muted-foreground">
              Other: {other} ({((other / total) * 100).toFixed(1)}%)
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export function NetworkGraph({ data }: NetworkGraphProps) {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Total queries over last 24 hours</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis 
                dataKey="timestamp"
                tickFormatter={formatTime}
                interval="preserveStartEnd"
              />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="forwarded" fill="#10b981" stackId="stack" />
              <Bar dataKey="cached" fill="#2563eb" stackId="stack" />
              <Bar dataKey="blocked" fill="#dc2626" stackId="stack" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
