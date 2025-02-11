"use server"

import { db } from "@/lib/db";

export interface DeviceStatus {
  deviceId: string;
  status: 'online' | 'offline' | 'idle';
  lastActivity?: Date;
  batteryLevel?: number;
  cpuUsage?: number;
  memoryUsage?: number;
}

export async function getDeviceStats(labId: string) {
  try {
    // Get all active devices in the lab
    const activeDevices = await db.activeDeviceUser.findMany({
      where: { labId },
      include: {
        device: true,
      },
    });

    // Get the latest power monitoring logs for each device
    const powerLogs = await db.powerMonitoringLogs.findMany({
      where: {
        labId,
        deviceId: {
          in: activeDevices.map(d => d.deviceId)
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      distinct: ['deviceId'],
    });

    // Get the latest activity logs for performance metrics
    const activityLogs = await db.activityLogs.findMany({
      where: {
        labId,
        deviceId: {
          in: activeDevices.map(d => d.deviceId)
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      distinct: ['deviceId'],
    });

    // Combine the data to create device statuses
    const deviceStatuses: DeviceStatus[] = activeDevices.map(active => {
      const powerLog = powerLogs.find(log => log.deviceId === active.deviceId);
      const activityLog = activityLogs.find(log => log.deviceId === active.deviceId);
      
      // Calculate status based on power logs and activity
      const status = determineDeviceStatus(powerLog, activityLog);

      return {
        deviceId: active.deviceId,
        status,
        lastActivity: activityLog?.createdAt,
        batteryLevel: getBatteryLevel(powerLog),
        cpuUsage: getCpuUsage(activityLog),
        memoryUsage: activityLog?.memoryUsage || 0,
      };
    });

    return {
      deviceStatuses,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error("Error fetching device stats:", error);
    return {
      deviceStatuses: [],
      timestamp: new Date(),
    };
  }
}

function determineDeviceStatus(
  powerLog?: { pm_status: string },
  activityLog?: { createdAt: Date }
): DeviceStatus['status'] {
  if (!powerLog) return 'offline';
  
  if (powerLog.pm_status.toLowerCase().includes('active')) {
    // Check if the last activity was within 5 minutes
    if (activityLog && Date.now() - activityLog.createdAt.getTime() < 5 * 60 * 1000) {
      return 'online';
    }
    return 'idle';
  }
  
  return 'offline';
}

function getBatteryLevel(powerLog?: { pm_status: string }): number | undefined {
  if (!powerLog) return undefined;
  
  // Extract battery level from power status if available
  const batteryMatch = powerLog.pm_status.match(/battery:(\d+)/i);
  return batteryMatch ? parseInt(batteryMatch[1], 10) : undefined;
}

function getCpuUsage(activityLog?: { title: string }): number | undefined {
  if (!activityLog) return undefined;
  
  // Extract CPU usage from activity log if available
  const cpuMatch = activityLog.title.match(/cpu:(\d+)/i);
  return cpuMatch ? parseInt(cpuMatch[1], 10) : undefined;
}
