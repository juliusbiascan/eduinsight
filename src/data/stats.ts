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
  studentCount: number;
  teacherCount: number;
}> {
  const previousFrom = subDays(dateRange.from!, 1);
  const previousTo = subDays(dateRange.to!, 1);

  const [totalLogins, totalUsers, totalDevices, activeNow, studentCount, teacherCount] = await Promise.all([
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
    db.deviceUser.count({
      where: {
        labId: labId,
        createdAt: {
          lte: previousTo,
        },
        role: 'STUDENT',
      },
    }),
    db.deviceUser.count({
      where: {
        labId: labId,
        createdAt: {
          lte: previousTo,
        },
        role: 'TEACHER',
      },
    })
  ]);

  return {
    totalLogins,
    totalUsers,
    totalDevices,
    activeNow,
    studentCount,
    teacherCount,
   
  };
}
