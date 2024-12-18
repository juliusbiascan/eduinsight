import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface RadialChartProps {
  data: {
    name: string;
    value: number;
    color: string;
  }[];
}

export const RadialChart: React.FC<RadialChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={35}
          outerRadius={50}
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg border text-xs">
                  <p>{`${payload[0].name}: ${payload[0].value}`}</p>
                </div>
              );
            }
            return null;
          }}
        />
        <Legend
          verticalAlign="bottom"
          height={20}
          iconSize={8}
          formatter={(value) => <span className="text-xs">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};