"use server"
import { db } from "@/lib/db";
import { DateRange } from "react-day-picker";

interface GraphData {
  name: string;
  total: number;
}

export const getRecentLogins = async (labId: string, dateRange?: DateRange) => {
  const userLogs = await db.activeUserLogs.findMany({
    where: {
      labId,
      createdAt: {
        gte: dateRange?.from,
        lte: dateRange?.to,
      },
    
    },
    include: {
      user: true,
      device: true,
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return userLogs
}

export const getGraphLogins = async (labId: string, dateRange?: DateRange) => {

  const userLogs = await db.activeUserLogs.findMany({
    where: {
      labId,
      createdAt: {
        gte: dateRange?.from,
        lte: dateRange?.to,
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  const monthlyRevenue: { [key: number]: number } = {};

  for (const log of userLogs) {
    const month = log.createdAt.getMonth();

    monthlyRevenue[month] = (monthlyRevenue[month] || 0) + 1;
  }

  const graphData: GraphData[] = [
    { name: 'Jan', total: 0 },
    { name: 'Feb', total: 0 },
    { name: 'Mar', total: 0 },
    { name: 'Apr', total: 0 },
    { name: 'May', total: 0 },
    { name: 'Jun', total: 0 },
    { name: 'Jul', total: 0 },
    { name: 'Aug', total: 0 },
    { name: 'Sep', total: 0 },
    { name: 'Oct', total: 0 },
    { name: 'Nov', total: 0 },
    { name: 'Dec', total: 0 }
  ];

  for (const month in monthlyRevenue) {
    graphData[parseInt(month)].total = monthlyRevenue[parseInt(month)];
  }

  return graphData;
}