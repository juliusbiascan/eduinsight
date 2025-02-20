"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Users, Clock, Cpu, BarChart2, PieChart } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell, LineChart, Line, PieChart as RePieChart,
  Pie, AreaChart, Area
} from 'recharts';
import {
  getDeviceUsageStats,
  getUserActivityStats,
  getHourlyUsageStats,
  getDevicePerformanceStats,
  getResourceUtilization
} from "@/data/analytics";
import { useTheme } from 'next-themes';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDateRange } from '@/hooks/use-date-range';
import { addDays } from 'date-fns';
import { DateRange } from 'react-day-picker';



interface DeviceUsageStats {
  name: string;
  usage: number;
}

interface UserActivityStats {
  name: string;
  activity: number;
}

interface HourlyUsage {
  hour: number;
  users: number;
  devices: number;
}

interface DevicePerformance {
  deviceId: string;
  name: string;  // Add this line
  cpu: number;
  memory: number;
  uptime: number;
}

interface ResourceUtilization {
  timestamp: string;
  cpu: number;
  memory: number | null;
  network: number;
}

const resourceColors = {
  cpu: { stroke: '#8884d8', fill: '#8884d833' },
  memory: { stroke: '#82ca9d', fill: '#82ca9d33' },
  network: { stroke: '#ffc658', fill: '#ffc65833' }
};


const AnalyticsPage = ({ params }: { params: { labId: string } }) => {
  const { theme } = useTheme();
 
  const [dateRange, setDateRange] = useState<DateRange>({
    from: addDays(new Date(), -30),
    to: new Date(),
});


  const [deviceUsageStats, setDeviceUsageStats] = useState<DeviceUsageStats[]>([]);
  const [userActivityStats, setUserActivityStats] = useState<UserActivityStats[]>([]);
  const [hourlyUsage, setHourlyUsage] = useState<HourlyUsage[]>([]);
  const [devicePerformance, setDevicePerformance] = useState<DevicePerformance[]>([]);
  const [resourceUtilization, setResourceUtilization] = useState<ResourceUtilization[]>([]);

  useEffect(() => {


    const fetchData = async () => {


      const [deviceStats, userStats, hourlyStats, perfStats, resourceStats] = await Promise.all([
        getDeviceUsageStats(params.labId, dateRange),
        getUserActivityStats(params.labId, dateRange),
        getHourlyUsageStats(params.labId, dateRange),
        getDevicePerformanceStats(params.labId, dateRange),
        getResourceUtilization(params.labId, dateRange)
      ]);

      setDeviceUsageStats(deviceStats);
      setUserActivityStats(userStats);
      setHourlyUsage(hourlyStats);
      setDevicePerformance(perfStats);
      setResourceUtilization(resourceStats);
    };
    fetchData();
  }, [params.labId, dateRange]);

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

  const yAxisLabelStyle = {
    position: 'insideLeft',
    angle: -90,
    fill: theme === 'dark' ? '#FFFFFF' : '#1A1617',
    fontSize: 12,
  };

  const formatTooltipValue = (value: number, label: string) => {
    return `${value} ${label}`;
  };

  const getStatusColor = (value: number) => {
    if (value >= 80) return '#ef4444'; // Critical - Red
    if (value >= 60) return '#f97316'; // Warning - Orange
    return '#22c55e'; // Good - Green
  };

  const calculateAverageUsage = (data: DeviceUsageStats[]) => {
    const total = data.reduce((sum, item) => sum + item.usage, 0);
    return (total / data.length).toFixed(1);
  };

  const formatResourceValue = (value: number) => `${value.toFixed(1)}%`;
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <Tabs defaultValue="usage" className="space-y-4">
      <TabsList>
        <TabsTrigger value="usage">Usage Analytics</TabsTrigger>
        <TabsTrigger value="performance">Performance Metrics</TabsTrigger>
        <TabsTrigger value="patterns">Usage Patterns</TabsTrigger>
      </TabsList>

      <TabsContent value="usage">
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
          <Card className="overflow-hidden bg-gradient-to-br from-white to-gray-100 dark:from-gray-800 dark:to-gray-900 shadow-md hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Activity className="h-4 w-4 mr-2" style={{ color: '#C9121F' }} />
                Device Usage Analytics
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Average usage: {calculateAverageUsage(deviceUsageStats)} sessions per device
              </p>
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
                    label={{ ...yAxisLabelStyle, value: 'Number of Sessions' }}
                  />
                  <Tooltip
                    formatter={(value: number) => formatTooltipValue(value, 'sessions')}
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
              <p className="text-sm text-muted-foreground mt-1">
                Overview of user interactions and engagement metrics.
              </p>
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
                    label={{ ...yAxisLabelStyle, value: 'Activity Count' }}
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
      </TabsContent>

      <TabsContent value="performance">
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
          <Card className="overflow-hidden bg-gradient-to-br from-white to-gray-100 dark:from-gray-800 dark:to-gray-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Cpu className="h-4 w-4 mr-2" style={{ color: '#C9121F' }} />
                Resource Utilization
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Real-time monitoring of CPU, Memory, and Network usage.
              </p>
            </CardHeader>
            <CardContent className="p-4 h-80">
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
                    label={{ ...yAxisLabelStyle, value: 'Usage %' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: chartConfig.style.background,
                      border: `1px solid ${chartConfig.grid.stroke}`,
                      borderRadius: '4px',
                      color: chartConfig.style.color
                    }}
                    formatter={(value: number) => formatResourceValue(value)}
                    labelFormatter={formatTimestamp}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="cpu"
                    name="CPU"
                    stroke={resourceColors.cpu.stroke}
                    fill={resourceColors.cpu.fill}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="memory"
                    name="Memory"
                    stroke={resourceColors.memory.stroke}
                    fill={resourceColors.memory.fill}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="network"
                    name="Network"
                    stroke={resourceColors.network.stroke}
                    fill={resourceColors.network.fill}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="overflow-hidden bg-gradient-to-br from-white to-gray-100 dark:from-gray-800 dark:to-gray-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <BarChart2 className="h-4 w-4 mr-2" style={{ color: '#C9121F' }} />
                Device Performance Metrics
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Detailed performance metrics for each device, including CPU and memory usage.
              </p>
            </CardHeader>
            <CardContent className="p-4 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={devicePerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    stroke={chartConfig.style.color}
                    tick={{ fill: chartConfig.style.color, fontSize: 12 }}
                  />
                  <YAxis
                    label={{ ...yAxisLabelStyle, value: 'Performance Metrics (%)' }}
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
                  <Legend />
                  <Bar dataKey="cpu" name="CPU Usage" fill="#8884d8" />
                  <Bar dataKey="memory" name="Memory Usage" fill="#82ca9d" />
                  <Bar dataKey="uptime" name="Uptime" fill="#ffc658" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="patterns">
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
          <Card className="overflow-hidden bg-gradient-to-br from-white to-gray-100 dark:from-gray-800 dark:to-gray-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Clock className="h-4 w-4 mr-2" style={{ color: '#C9121F' }} />
                Hourly Usage Distribution
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Distribution of active users and devices throughout each hour.
              </p>
            </CardHeader>
            <CardContent className="p-4 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={hourlyUsage}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis
                    label={{ ...yAxisLabelStyle, value: 'Number of Active Users/Devices' }}
                  />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="users" stroke="#8884d8" />
                  <Line type="monotone" dataKey="devices" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="overflow-hidden bg-gradient-to-br from-white to-gray-100 dark:from-gray-800 dark:to-gray-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <PieChart className="h-4 w-4 mr-2" style={{ color: '#C9121F' }} />
                User Session Distribution
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Breakdown of user session activities across different categories.
              </p>
            </CardHeader>
            <CardContent className="p-4 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={userActivityStats}
                    dataKey="activity"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {userActivityStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getRandomColor('user', index)} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </RePieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
}

export default AnalyticsPage;
