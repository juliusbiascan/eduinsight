"use server"

import { db } from "@/lib/db";
import { DateRange } from "react-day-picker";
import { subDays } from 'date-fns';
import { State } from "@prisma/client";

export async function getPreviousStats(labId: string, dateRange: DateRange): Promise<{
  totalLogins: number;
  totalUsers: number;
  totalDevices: number;
  activeNow: number;
}> {
  if (!dateRange.from || !dateRange.to) {
    return {
      totalLogins: 0,
      totalUsers: 0,
      totalDevices: 0,
      activeNow: 0,
    };
  }

  const currentPeriodDays = Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24));
  const previousFrom = new Date(dateRange.from);
  previousFrom.setDate(previousFrom.getDate() - currentPeriodDays);
  const previousTo = new Date(dateRange.from);
  previousTo.setDate(previousTo.getDate() - 1);

  const [totalLogins, totalUsers, totalDevices, activeNow] = await Promise.all([
    db.activeUserLogs.count({
      where: {
        labId: labId,
        createdAt: {
          gte: previousFrom,
          lte: previousTo,
        },
      },
    }),
    db.deviceUser.count({
      where: {
        labId: labId,
        createdAt: {
          lte: previousTo,
        },
      },
    }),
    db.device.count({
      where: {
        labId: labId,
        createdAt: {
          lte: previousTo,
        },
      },
    }),
    db.activeDeviceUser.count({
      where: {
        labId: labId,
        createdAt: {
          lte: previousTo,
        },
        state: State.ACTIVE,
      },
    }),
  ]);

  return {
    totalLogins,
    totalUsers,
    totalDevices,
    activeNow,
  };
}
