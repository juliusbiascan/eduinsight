"use server"

import { db } from "@/lib/db";
import { DateRange } from "react-day-picker";

export async function getDeviceUsageStats(labId: string, dateRange: DateRange) {
  const devices = await db.device.findMany({
    where: {
      labId: labId,
    },
    select: {
      id: true,
      name: true,
    },
  });

  const devicesLogs = await db.activeUserLogs.groupBy({
    by: ['deviceId'],
    where: {
      labId: labId,
      createdAt: {
        gte: dateRange.from,
        lte: dateRange.to,
      },
    },
    _count: {
      userId: true,
    },
  });

  const deviceUsage = devicesLogs.reduce((acc, log) => {
    acc[log.deviceId] = log._count.userId;
    return acc;
  }, {} as Record<string, number>);

  const deviceMap = new Map(devices.map(device => [device.id, device.name]));

  const sortedDevices = Object.entries(deviceUsage)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  return sortedDevices.map(([deviceId, usage]) => ({
    name: deviceMap.get(deviceId) || `Device ${deviceId}`,
    usage,
  }));
}

export async function getUserActivityStats(labId: string, dateRange: DateRange) {
  const users = await db.deviceUser.findMany({
    where: {
      labId: labId,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
    },
  });

  const userActivity = await db.activeUserLogs.groupBy({
    by: ['userId'],
    where: {
      labId: labId,
      createdAt: {
        gte: dateRange.from,
        lte: dateRange.to,
      },
    },
    _count: {
      _all: true,
    },
  });

  const activityCount = userActivity.reduce((acc, log) => {
    acc[log.userId] = log._count._all;
    return acc;
  }, {} as Record<string, number>);

  const userMap = new Map(users.map(user => [user.id, `${user.firstName} ${user.lastName}`]));

  const sortedUsers = Object.entries(activityCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  return sortedUsers.map(([userId, activity]) => ({
    name: userMap.get(userId) || `User ${userId}`,
    activity,
  }));
}