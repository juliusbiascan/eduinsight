"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Users } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { DateRange } from "react-day-picker";
import { getDeviceUsageStats, getUserActivityStats } from "@/data/analytics";
import { useTheme } from 'next-themes';

interface AnalyticsTabsProps {
  labId: string;
  dateRange: DateRange;
}

interface DeviceUsageStats {
  name: string;
  usage: number;
}

interface UserActivityStats {
  name: string;
  activity: number;
}

export const AnalyticsTabs: React.FC<AnalyticsTabsProps> = ({ labId, dateRange }) => {
  const { theme } = useTheme();
  const [deviceUsageStats, setDeviceUsageStats] = useState<DeviceUsageStats[]>([]);
  const [userActivityStats, setUserActivityStats] = useState<UserActivityStats[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [deviceStats, userStats] = await Promise.all([
        getDeviceUsageStats(labId, dateRange),
        getUserActivityStats(labId, dateRange)
      ]);
      setDeviceUsageStats(deviceStats);
      setUserActivityStats(userStats);
    };
    fetchData();
  }, [labId, dateRange]);

  const colors = useMemo(() => ({
    device: [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD',
      '#D4A5A5', '#9B6B6B', '#CE97B0', '#AFC1D6', '#92A8D1'
    ],
    user: [
      '#FF9999', '#66B2B2', '#99C2FF', '#FFB366', '#99FF99',
      '#FF99CC', '#99CCFF', '#FFE5CC', '#B8E6B8', '#FFB3B3'
    ]
  }), []);

  const getRandomColor = (type: 'device' | 'user', index: number) => {
    const colorArray = colors[type];
    return colorArray[index % colorArray.length];
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

  return (
    <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
      <Card className="overflow-hidden bg-gradient-to-br from-white to-gray-100 dark:from-gray-800 dark:to-gray-900 shadow-md hover:shadow-xl transition-all duration-300">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Activity className="h-4 w-4 mr-2" style={{ color: '#C9121F' }} />
            Device Usage Analytics
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 h-80">
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
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: chartConfig.style.background,
                  border: `1px solid ${chartConfig.grid.stroke}`,
                  color: chartConfig.style.color,
                  borderRadius: '4px',
                  padding: '8px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar
                dataKey="usage"
                radius={[4, 4, 0, 0]}
                fill="#C9121F"
              >
                {
                  deviceUsageStats.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={getRandomColor('device', index)}
                    />
                  ))
                }
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="overflow-hidden bg-gradient-to-br from-white to-gray-100 dark:from-gray-800 dark:to-gray-900 shadow-md hover:shadow-xl transition-all duration-300">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Users className="h-4 w-4 mr-2" style={{ color: '#C9121F' }} />
            User Activity Analytics
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={userActivityStats}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartConfig.grid.stroke} />
              <XAxis
                dataKey="name"
                stroke={chartConfig.style.color}
                tick={{ fill: chartConfig.style.color, fontSize: 12 }}
              />
              <YAxis
                stroke={chartConfig.style.color}
                tick={{ fill: chartConfig.style.color, fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: chartConfig.style.background,
                  border: `1px solid ${chartConfig.grid.stroke}`,
                  color: chartConfig.style.color,
                  borderRadius: '4px',
                  padding: '8px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar
                dataKey="activity"
                radius={[4, 4, 0, 0]}
                fill="#C9121F"
              >
                {
                  userActivityStats.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={getRandomColor('user', index)}
                    />
                  ))
                }
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};