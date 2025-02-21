'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, Users, Clock, Laptop } from "lucide-react";
import { useDateRange } from '@/hooks/use-date-range';
import { calculateAverageUsage, calculateGrowthRate } from '@/lib/utils/calculate-stats';
import { getOverviewStats } from "@/data/analytics";
import { useEffect, useState } from "react";

export default function OverviewSection({ params }: { params: { labId: string } }) {
  const { dateRange } = useDateRange();
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    const fetchData = async () => {
      const data = await getOverviewStats(params.labId, dateRange);
      setStats(data);
    };
    fetchData();
  }, [params.labId, dateRange]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalSessions}</div>
          <div className="text-xs text-muted-foreground">
            {calculateGrowthRate(stats.totalSessions, stats.previousSessions)}% from last period
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Active Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeUsers}</div>
          <div className="text-xs text-muted-foreground">
            {calculateGrowthRate(stats.activeUsers, stats.previousActiveUsers)}% from last period
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Avg. Session Duration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.avgSessionDuration}m</div>
          <div className="text-xs text-muted-foreground">
            {calculateGrowthRate(stats.avgSessionDuration, stats.previousAvgDuration)}% from last period
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Device Utilization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.deviceUtilization}%</div>
          <div className="text-xs text-muted-foreground">
            {calculateGrowthRate(stats.deviceUtilization, stats.previousUtilization)}% from last period
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
