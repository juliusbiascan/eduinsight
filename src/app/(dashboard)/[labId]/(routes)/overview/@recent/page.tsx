"use client"

import { RecentUsers, RecentUsersType } from "@/components/recent-users";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Device, DeviceUser } from "@prisma/client";
import { useMemo, useState, useEffect } from "react";
import { useDateRange } from '@/hooks/use-date-range';
import { getRecentLogins } from "@/data/get-graph-count";

interface RecentLoginData {
  id: string;
  labId: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  device: Device;
  user: DeviceUser;
}

const RecentPage = ({
  params
}: {
  params: { labId: string }
}) => {
  const { dateRange } = useDateRange();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<{ recentLogin: RecentLoginData[] }>({ recentLogin: [] });

  useEffect(() => {
    const fetchRecentLogins = async () => {
      setIsLoading(true);
      try {
        const recentLogins = await getRecentLogins(params.labId, dateRange);
        setData({ recentLogin: recentLogins });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRecentLogins();
  }, [params.labId, dateRange]);

  const formattedRecentLogin: RecentUsersType[] = useMemo(
    () =>
      data.recentLogin.map((item) => ({
        id: item.id,
        labId: item.labId,
        userId: item.userId,
        device: item.device,
        user: item.user,
        createdAt: new Date(item.createdAt),
      })),
    [data.recentLogin]
  );

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getDateRangeDescription = (from: Date | undefined, to: Date | undefined) => {
    if (!from || !to) return "this period";
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
    
    // Check if date range is today
    if (from.getTime() === today.getTime() && to.getTime() === today.getTime()) {
      return "today";
    }

    // Check if date range is yesterday
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (from.getTime() === yesterday.getTime() && to.getTime() === yesterday.getTime()) {
      return "yesterday";
    }

    // Check for common ranges
    if (diffDays === 7) return "last 7 days";
    if (diffDays === 30) return "last 30 days";
    if (diffDays === 90) return "last 3 months";

    // Default format for custom ranges
    return `from ${from.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} to ${to.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  return (
    <Card className="h-[435px] flex flex-col">
      <CardHeader>
        <CardTitle>Recent Visits</CardTitle>
        <CardDescription>
          {formattedRecentLogin.length} {formattedRecentLogin.length === 1 ? 'visit' : 'visits'} {getDateRangeDescription(dateRange?.from, dateRange?.to)}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 min-h-0">
        <RecentUsers data={formattedRecentLogin} isLoading={isLoading} />
      </CardContent>
    </Card>
  );
}

export default RecentPage;