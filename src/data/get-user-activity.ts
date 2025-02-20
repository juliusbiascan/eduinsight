"use server"
import { db } from "@/lib/db";
import { DateRange } from "react-day-picker";

export const getUserActivity = async (labId: string, dateRange?: DateRange) => {
  const activities = await db.activeUserLogs.findMany({
    where: {
      labId,
      createdAt: {
        gte: dateRange?.from,
        lte: dateRange?.to,
      }
    },
    include: {
      user: true
    },
    orderBy: {
      createdAt: 'asc'
    }
  });

  // Group activities by date and role
  const dailyData = activities.reduce((acc: any, activity) => {
    const date = activity.createdAt.toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = { teacher: 0, students: 0 };
    }
    
    if (activity.user.role === 'TEACHER') {
      acc[date].teacher += 1;
    } else {
      acc[date].students += 1;
    }
    return acc;
  }, {});

  // Convert to array format
  return Object.entries(dailyData).map(([date, counts]) => ({
    date,
    ...counts as { teacher: number, students: number }
  }));
};

export const getDeviceStats = async (labId: string, dateRange?: DateRange) => {
  const activities = await db.activeUserLogs.findMany({
    where: {
      labId,
      createdAt: {
        gte: dateRange?.from,
        lte: dateRange?.to,
      }
    },
    select: {
      device: true
    }
  });

  const deviceCounts = activities.reduce((acc: Record<string, number>, curr) => {
    const device = (curr.device?.name.toLowerCase() || 'unknown').trim();
    acc[device] = (acc[device] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(deviceCounts)
    .sort((a, b) => b[1] - a[1]) // Sort by count in descending order
    .map(([devices, visitors]) => ({
      devices,
      visitors
    }));
};

export const getUniqueDevices = async () => {
  const devices = await db.activeUserLogs.findMany({
   
    select: {
      device: true
    }
  });
  
  return devices.map(d => d.device?.name.toLowerCase() || 'unknown')
    .filter((value, index, self) => self.indexOf(value) === index);
};
