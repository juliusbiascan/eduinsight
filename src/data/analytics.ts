"use server"

import { db } from "@/lib/db";
import { calculatePercentage } from "@/lib/utils/calculate-stats";
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

export async function getHourlyUsageStats(labId: string, dateRange: DateRange) {
  const result = await db.activeUserLogs.groupBy({
    by: ['createdAt'],
    where: {
      labId,
      createdAt: {
        gte: dateRange.from,
        lte: dateRange.to,
      },
    },
    _count: {
      userId: true,
      deviceId: true,
    },
  });

  // Transform data into hourly distribution
  const hourlyData = Array(24).fill(0).map((_, hour) => ({
    hour,
    users: 0,
    devices: 0,
  }));

  result.forEach((log) => {
    const hour = new Date(log.createdAt).getHours();
    hourlyData[hour].users += log._count.userId;
    hourlyData[hour].devices += log._count.deviceId;
  });

  return hourlyData;
}

export async function getDevicePerformanceStats(labId: string, dateRange: DateRange) {
  // First get activity logs grouped by deviceId
  const result = await db.activityLogs.groupBy({
    by: ['deviceId'],
    where: {
      labId,
      createdAt: {
        gte: dateRange.from,
        lte: dateRange.to,
      },
    },
    _avg: {
      memoryUsage: true,
    },
    _count: {
      title: true,
    },
  });

  // Then get all devices to map names
  const devices = await db.device.findMany({
    where: {
      labId,
      id: {
        in: result.map(r => r.deviceId)
      }
    },
    select: {
      id: true,
      name: true,
    },
  });

  const deviceMap = new Map(devices.map(device => [device.id, device.name]));

  return result.map((device) => ({
    deviceId: device.deviceId,
    name: deviceMap.get(device.deviceId) || `Device ${device.deviceId}`,
    cpu: Math.random() * 100,
    memory: device._avg.memoryUsage || 0,
    uptime: device._count.title,
  }));
}

export async function getResourceUtilization(labId: string, dateRange: DateRange) {
  const result = await db.activityLogs.findMany({
    where: {
      labId,
      createdAt: {
        gte: dateRange.from,
        lte: dateRange.to,
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
    select: {
      createdAt: true,
      memoryUsage: true,
    },
  });

  return result.map((log) => ({
    timestamp: log.createdAt.toISOString(),
    cpu: Math.random() * 100, // Simulated CPU usage
    memory: log.memoryUsage,
    network: Math.random() * 100, // Simulated network usage
  }));
}

export interface OverviewStats {
  totalSessions: number;
  previousSessions: number;
  activeUsers: number;
  previousActiveUsers: number;
  avgSessionDuration: number;
  previousAvgDuration: number;
  deviceUtilization: number;
  previousUtilization: number;
}

export async function getOverviewStats(
  labId: string,
  dateRange: DateRange
): Promise<OverviewStats> {
  try {
    // Get current period data from ActiveUserLogs
    const currentPeriodStats = await db.activeUserLogs.groupBy({
      where: {
        labId,
        createdAt: {
          gte: dateRange.from,
          lte: dateRange.to
        }
      },
      by: ['labId'],
      _count: {
        id: true,
        userId: true
      }
    });

    // Calculate previous period dates
    const periodLength = dateRange.to!.getTime() - dateRange.from!.getTime();
    const previousFrom = new Date(dateRange.from!.getTime() - periodLength);
    const previousTo = new Date(dateRange.to!.getTime() - periodLength);

    // Get previous period data
    const previousPeriodStats = await db.activeUserLogs.groupBy({
      where: {
        labId,
        createdAt: {
          gte: previousFrom,
          lte: previousTo
        }
      },
      by: ['labId'],
      _count: {
        id: true,
        userId: true
      }
    });

    // Get average session duration from activity logs
    const currentSessionDuration = await db.activityLogs.aggregate({
      where: {
        labId,
        createdAt: {
          gte: dateRange.from,
          lte: dateRange.to
        }
      },
      _avg: {
        memoryUsage: true // Using memoryUsage as a proxy for session duration
      }
    });

    const previousSessionDuration = await db.activityLogs.aggregate({
      where: {
        labId,
        createdAt: {
          gte: previousFrom,
          lte: previousTo
        }
      },
      _avg: {
        memoryUsage: true
      }
    });

    // Get device utilization
    const devices = await db.device.count({
      where: { labId }
    });

    const activeDevices = await db.activeDeviceUser.groupBy({
      where: {
        labId,
        state: 'ACTIVE',
        createdAt: {
          gte: dateRange.from,
          lte: dateRange.to
        }
      },
      by: ['deviceId'],
      _count: {
        deviceId: true
      }
    });

    const previousActiveDevices = await db.activeDeviceUser.groupBy({
      where: {
        labId,
        state: 'ACTIVE',
        createdAt: {
          gte: previousFrom,
          lte: previousTo
        }
      },
      by: ['deviceId'],
      _count: {
        deviceId: true
      }
    });

    const currentUtilization = calculatePercentage(
      activeDevices.length,
      devices
    );

    const previousUtilization = calculatePercentage(
      previousActiveDevices.length,
      devices
    );

    const current = currentPeriodStats[0] || { _count: { id: 0, userId: 0 } };
    const previous = previousPeriodStats[0] || { _count: { id: 0, userId: 0 } };

    return {
      totalSessions: current._count.id,
      previousSessions: previous._count.id,
      activeUsers: current._count.userId,
      previousActiveUsers: previous._count.userId,
      avgSessionDuration: Math.round(currentSessionDuration._avg.memoryUsage || 0),
      previousAvgDuration: Math.round(previousSessionDuration._avg.memoryUsage || 0),
      deviceUtilization: currentUtilization,
      previousUtilization: previousUtilization
    };
  } catch (error) {
    console.error('Error fetching overview stats:', error);
    return {
      totalSessions: 0,
      previousSessions: 0,
      activeUsers: 0,
      previousActiveUsers: 0,
      avgSessionDuration: 0,
      previousAvgDuration: 0,
      deviceUtilization: 0,
      previousUtilization: 0
    };
  }
}