"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getTotalDevices } from "@/data/device";
import { getActiveCount, getStudentCount, getTeacherCount } from "@/actions/staff";
import { getAllDeviceUserCount } from "@/data/user";
import { getGraphLogins, getRecentLogins } from "@/data/get-graph-count";
import { DateRange } from "react-day-picker";
import { addDays, format } from 'date-fns';
import { getPreviousStats } from "@/data/stats";
import { CalendarDateRangePicker } from "@/components/date-range-picker";
import { Button } from "@/components/ui/button";
import { Rainbow, Download, Activity, Laptop, TrendingUp, Users, Heart, Sparkles, Frown } from "lucide-react";
import { PDFDownloadLink } from '@react-pdf/renderer';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecentUsers, RecentUsersType } from "../../../../components/recent-users";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnalyticsTabs } from "./analytics-tabs";
import { Overview } from "../../../../components/overview";
import { StatsCard } from '../../../../components/stats-card';
import { DashboardReport } from './dashboard-report';
import { RadialChart } from '@/components/radial-chart';
import { useSocket } from '@/providers/socket-provider';
import { LatencyGraph } from '@/components/latency-graph';
import { useTheme } from 'next-themes'; // Import useTheme from next-themes
import { Heading } from '@/components/ui/heading';

interface DashboardPageProps { params: { labId: string; }; }

interface GraphData {
  name: string;
  total: number;
}

interface RecentLoginData {
  id: string;
  labId: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

interface DashboardData {
  allDevices: number;
  activeCount: number;
  allUser: number;
  graphLogin: GraphData[];
  recentLogin: RecentLoginData[];
  previousStats: {
    totalLogins: number;
    totalUsers: number;
    totalDevices: number;
    activeNow: number;
    studentCount: number;
    teacherCount: number;
  };
  studentCount: number;
  teacherCount: number;
}

export const DashboardClient: React.FC<DashboardPageProps> = ({ params }) => {
  
  const { socket, isConnected } = useSocket();

  const [dateRange, setDateRange] = useState<DateRange>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  const [data, setData] = useState<DashboardData>({
    allDevices: 0,
    activeCount: 0,
    allUser: 0,
    graphLogin: [],
    recentLogin: [],
    previousStats: {
      totalLogins: 0,
      totalUsers: 0,
      totalDevices: 0,
      activeNow: 0,
      studentCount: 0,
      teacherCount: 0,
    },
    studentCount: 0,
    teacherCount: 0,
   
  });

  const [latencyHistory, setLatencyHistory] = useState<Array<{ time: Date; value: number }>>([]);
  const [latency, setLatency] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchData = useCallback(async (newDateRange: DateRange) => {
    const [
      allDevices,
      activeCount,
      allUser,
      graphLogin,
      recentLogin,
      previousStats,
      studentCount,
      teacherCount,
    ] = await Promise.all([
      getTotalDevices(params.labId, newDateRange),
      getActiveCount(params.labId, newDateRange),
      getAllDeviceUserCount(params.labId, newDateRange),
      getGraphLogins(params.labId, newDateRange),
      getRecentLogins(params.labId, newDateRange),
      getPreviousStats(params.labId, newDateRange),
      getStudentCount(params.labId, newDateRange),
      getTeacherCount(params.labId, newDateRange),
     
    ]);

    setData({
      allDevices: allDevices || 0,
      activeCount: activeCount || 0,
      allUser: allUser || 0,
      graphLogin: graphLogin || [],
      recentLogin: recentLogin || [],
      previousStats: previousStats || {
        totalLogins: 0,
        totalUsers: 0,
        totalDevices: 0,
        activeNow: 0,
        studentCount: 0,
        teacherCount: 0,
    
      },
      studentCount: studentCount || 0,
      teacherCount: teacherCount || 0,
    });
  }, [params.labId]);

  useEffect(() => {
    fetchData(dateRange);
  }, [dateRange, params.labId, fetchData]);

  useEffect(() => {
    if (socket && isConnected) {
      const interval = setInterval(() => {
        const start = Date.now();
        socket.emit('ping');
        socket.on('pong', () => {
          const currentLatency = Date.now() - start;
          setLatency(currentLatency);
          setLastUpdated(new Date());
          setLatencyHistory(prev => {
            const newHistory = [...prev, { time: new Date(), value: currentLatency }];
            return newHistory.slice(-20); // Keep last 20 measurements
          });
        });
      }, 3000); // Update every 3 seconds

      return () => {
        clearInterval(interval);
        socket.off('pong');
      };
    }
  }, [socket, isConnected]);

  const formattedRecentLogin: RecentUsersType[] = useMemo(() =>
    data.recentLogin.map((item) => ({
      id: item.id,
      labId: item.labId,
      userId: item.userId,
      createdAt: new Date(item.createdAt), // Ensure proper Date object
    })), [data.recentLogin]);

  const handleDateRangeChange = (newRange: DateRange | undefined) => {
    if (newRange && newRange.from && newRange.to) {
      setDateRange(newRange);
      fetchData(newRange);
    }
  };

  const generateReportData = useCallback(() => {
    return {
      totalLogins: data.recentLogin.length,
      totalUsers: data.allUser,
      totalDevices: data.allDevices,
      activeNow: data.activeCount,
      dateRange,
    };
  }, [data.recentLogin.length, data.allUser, data.allDevices, data.activeCount, dateRange]);

  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    const trend = ((current - previous) / previous) * 100;
    return Number(trend.toFixed(2));
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 p-2 sm:p-4">
      <div className="w-full lg:w-3/4 space-y-4">
        <Card className="bg-white dark:bg-[#1A1617] backdrop-blur supports-[backdrop-filter]:bg-opacity-60">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Rainbow className="w-8 h-8 text-[#C9121F]" />
                <Heading
                  title="Dashboard"
                  description="Monitor lab activity and statistics"
                  className="text-black dark:text-white"
                />
              </div>
              <div className="flex items-center space-x-2">
                <CalendarDateRangePicker
                  value={dateRange}
                  onChange={handleDateRangeChange}
                />
                <PDFDownloadLink
                  document={<DashboardReport data={generateReportData()} />}
                  fileName={`dashboard-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`}
                >
                  <Button
                    size="sm"
                    className="bg-[#C9121F] hover:bg-red-700 text-white text-sm py-1 h-8"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download Report
                  </Button>
                </PDFDownloadLink>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <StatsCard
            title="Total Logins"
            value={data.recentLogin.length}
            icon={<TrendingUp className="h-4 w-4" style={{ color: '#C9121F' }} />}
            trend={calculateTrend(data.recentLogin.length, data.previousStats.totalLogins)}

          />
          <StatsCard
            title="Total Users"
            value={data.allUser}
            icon={<Users className="h-4 w-4" style={{ color: '#1A1617' }} />}
            trend={calculateTrend(data.allUser, data.previousStats.totalUsers)}

          />
          <StatsCard
            title="Total Devices"
            value={data.allDevices}
            icon={<Laptop className="h-4 w-4" style={{ color: '#1A1617' }} />}
            trend={calculateTrend(data.allDevices, data.previousStats.totalDevices)}

          />
         

          <div className="col-span-full grid gap-4 grid-cols-1 sm:grid-cols-3">
            <StatsCard
              title="Students"
              value={data.studentCount}
              icon={<Users className="h-4 w-4" style={{ color: '#1A1617' }} />}
              trend={calculateTrend(data.studentCount, data.previousStats.studentCount)}
            />
            <StatsCard
              title="Teachers"
              value={data.teacherCount}
              icon={<Users className="h-4 w-4" style={{ color: '#1A1617' }} />}
              trend={calculateTrend(data.teacherCount, data.previousStats.teacherCount)}
            />
            <StatsCard
            title="Active Now"
            value={data.activeCount}
            icon={<Activity className="h-4 w-4" style={{ color: '#1A1617' }} />}
            trend={calculateTrend(data.activeCount, data.previousStats.activeNow)}

          />
          </div>

          <div className="col-span-full grid gap-4 grid-cols-1 sm:grid-cols-2">
            <Card className='overflow-hidden bg-gradient-to-br from-white to-gray-100 dark:from-gray-800 dark:to-gray-900 shadow-md hover:shadow-xl transition-all duration-300'>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Activity className="h-4 w-4 mr-2" style={{ color: '#C9121F' }} />
                      Server Status
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="text-sm">{isConnected ? 'Online' : 'Offline'}</span>
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Current Latency</span>
                      <span className="font-medium">{latency ? `${latency}ms` : 'N/A'}</span>
                    </div>
                    <div className="h-[120px]">
                      <LatencyGraph data={latencyHistory} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className='overflow-hidden bg-gradient-to-br from-white to-gray-100 dark:from-gray-800 dark:to-gray-900 shadow-md hover:shadow-xl transition-all duration-300'>

              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Laptop className="h-4 w-4 mr-2" style={{ color: '#C9121F' }} />
                      Device Status
                    </div>
                    <span className="text-sm">{data.activeCount} / {data.allDevices} active</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[120px]">
                  <RadialChart
                    data={[
                      { name: 'Active', value: data.activeCount, color: '#10B981' },
                      { name: 'Inactive', value: data.allDevices - data.activeCount, color: '#6B7280' },
                    ]}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="bg-[#EAEAEB] dark:bg-[#1A1617] p-1">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-[#C9121F] data-[state=active]:text-white"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-[#C9121F] data-[state=active]:text-white"
            >
              Analytics
            </TabsTrigger>

          </TabsList>

          <TabsContent value="overview">
            <Card className="bg-[#EAEAEB] dark:bg-[#1A1617] backdrop-blur supports-[backdrop-filter]:bg-opacity-60 w-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                  <Heart className="h-4 w-4 text-[#C9121F] mr-2" />
                  Login Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <Overview data={data.graphLogin} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card className="bg</TabsContent>-[#EAEAEB] dark:bg-[#1A1617] backdrop-blur supports-[backdrop-filter]:bg-opacity-60">
              <CardContent className="p-4">
                <AnalyticsTabs labId={params.labId} dateRange={dateRange} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <div className="w-full lg:w-1/4 pb-4">
        <Card className="h-full bg-white dark:bg-[#1A1617] backdrop-blur supports-[backdrop-filter]:bg-opacity-60">
          <CardHeader className="pb-2 border-b">
            <CardTitle className="text-base flex items-center">
              <Sparkles className="h-4 w-4 text-[#C9121F] mr-2" />
              Recent Logins
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 h-[calc(100%-3.5rem)]">
            <RecentUsers data={formattedRecentLogin} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
