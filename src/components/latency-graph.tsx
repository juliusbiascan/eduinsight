// components/LatencyGraph.tsx
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { format } from "date-fns";

interface LatencyGraphProps {
  data: Array<{ time: Date; value: number }>;
}

export const LatencyGraph = ({ data }: LatencyGraphProps) => {
  const formattedData = data.map(item => ({
    time: format(item.time, 'HH:mm:ss'),
    value: item.value,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={formattedData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
        <defs>
          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false}/>
        <XAxis
          dataKey="time"
          stroke="#888888"
          fontSize={10}
          tickLine={false}
          axisLine={false}
          interval="preserveEnd"
          tick={{ fontSize: 10 }}
        />
        <YAxis
          stroke="#888888"
          fontSize={10}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}ms`}
          tick={{ fontSize: 10 }}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg border text-xs">
                  <p>{`${payload[0].value}ms`}</p>
                </div>
              );
            }
            return null;
          }}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#10B981"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
          animationDuration={300}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};