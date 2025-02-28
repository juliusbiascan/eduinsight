"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

interface ClientActivityGraphProps {
  data: {
    clients: {
      [key: string]: {
        name: string | null;
        total: number;
      };
    };
    history: {
      timestamp: number;
      data: {
        [key: string]: number;
      };
    }[];
  }
}

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const total = payload.reduce((sum: number, entry: any) => sum + (entry.value || 0), 0);
    
    return (
      <div className="bg-white/95 p-4 rounded-lg shadow-md border-border border">
        <p className="font-medium mb-2 text-sm">
          {formatTime(label)}
        </p>
        <div className="space-y-1">
          {payload.map((entry: any) => (
            <div key={entry.name} className="flex items-center gap-2">
              <div className="w-2 h-2" style={{ backgroundColor: entry.color }} />
              <span className="text-sm text-muted-foreground">
                {entry.name}: {entry.value} ({((entry.value / total) * 100).toFixed(1)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export function ClientActivityGraph({ data }: ClientActivityGraphProps) {
  const colors = [
    "#10b981", "#2563eb", "#dc2626", "#9333ea", 
    "#0891b2", "#ca8a04", "#be185d", "#059669"
  ];

  const formattedData = data.history.map(entry => ({
    timestamp: entry.timestamp,
    ...entry.data
  }));

  const clients = Object.entries(data.clients)
    .sort(([, a], [, b]) => b.total - a.total)
    .slice(0, 8);

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Client activity over last 24 hours</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formattedData}>
              <XAxis
                dataKey="timestamp"
                tickFormatter={formatTime}
                interval="preserveStartEnd"
              />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              {clients.map(([clientId, client], index) => (
                <Bar
                  key={clientId}
                  dataKey={clientId}
                  name={client.name || clientId}
                  stackId="stack"
                  fill={colors[index % colors.length]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
