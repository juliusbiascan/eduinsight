"use client"
import { Skeleton } from "@/components/ui/skeleton";
import { getDeviceById } from "@/data/device";
import { getDeviceUserById, getUserById } from "@/data/user";
import { Device, DeviceUser, PowerMonitoringLogs } from "@prisma/client";
import { useEffect, useState, useTransition } from "react";

interface LogItemProps {
  item: PowerMonitoringLogs
}

export const LogItem: React.FC<LogItemProps> = ({
  item
}) => {

  const [user, setUser] = useState<DeviceUser>();
  const [device, setDevice] = useState<Device>();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const fetchData = async () => {
      const u = await getDeviceUserById(item.userId);
      if (u) {
        setUser(u);
      }

      const d = await getDeviceById(item.deviceId);
      if (d) {
        setDevice(d)
      }

    }
    startTransition(() => {
      fetchData();
    })
  }, [item]);

  const getPowerState = (pm_status: number) => {
    if (pm_status === 0) {
      return "The system is going to sleep";
    } else if (pm_status === 1) {
      return "The system is resuming";
    } else if (pm_status === 2) {
      return "The system is on AC Power (charging)";
    } else if (pm_status === 3) {
      return "The system is on Battery Power";
    } else if (pm_status === 4) {
      return "The system is Shutting Down";
    } else if (pm_status === 5) {
      return "The system is about to be locked";
    } else if (pm_status === 6) {
      return "The system is unlocked";
    } else {
      return "Unknown State";
    }
  };

  if (isPending) {
    return (<div className="grid grid-cols-4 gap-4">
      <Skeleton className="w-full h-4"></Skeleton>
      <Skeleton className="w-full h-4"></Skeleton>
      <Skeleton className="w-full h-4"></Skeleton>
      <Skeleton className="w-full h-4"></Skeleton>

    </div>)
  }

  return (
    <div className="grid grid-cols-4 gap-4">
      <div>{item.pm_log_ts}</div>
      <div>{getPowerState(Number.parseInt(item.pm_status))}</div>
      <div>{user && user.firstName} {user && user.lastName}</div>
      <div>{device && device.name}</div>
    </div>
  )
}