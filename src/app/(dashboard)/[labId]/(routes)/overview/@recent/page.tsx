"use client"

import { RecentUsers, RecentUsersType } from "@/components/recent-users";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Device, DeviceUser } from "@prisma/client";
import { useMemo, useState, useEffect } from "react";
import { useDateRange } from '@/hooks/use-date-range';
import { getRecentLogins } from "@/data/get-graph-count";
import { Skeleton } from "@/components/ui/skeleton";

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

  if (isLoading) {
    return (
      <Card className="h-[435px] flex flex-col">
        <CardHeader>
          <Skeleton className="h-6 w-[180px] mb-2" />
          <Skeleton className="h-4 w-[250px]" />
        </CardHeader>
        <CardContent className="flex-1 min-h-0">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[150px]" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[435px] flex flex-col">
      <CardHeader>
        <CardTitle>Lab Session History</CardTitle>
        <CardDescription>
          {formattedRecentLogin.length === 0 ? (
            "No lab sessions recorded"
          ) : (
            `${formattedRecentLogin.length} ${formattedRecentLogin.length === 1 ? 'person used' : 'people used'} the lab ${getDateRangeDescription(dateRange?.from, dateRange?.to)}`
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 min-h-0">
        {formattedRecentLogin.length === 0 ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            No activity to display
          </div>
        ) : (
          <RecentUsers data={formattedRecentLogin} isLoading={isLoading} />
        )}
      </CardContent>
    </Card>
  );
}

export default RecentPage;