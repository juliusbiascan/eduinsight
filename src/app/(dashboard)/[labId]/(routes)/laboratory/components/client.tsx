"use client";

import React, { } from 'react';
import { logoutUser } from "@/actions/logout";
import { LogOut } from "lucide-react";
import toast from "react-hot-toast";
import { useSocket } from '@/providers/socket-provider';
import { Heading } from '@/components/ui/heading';
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { MonitoringStats } from "./monitoring-stats";
import { DeviceGrid } from "./device-grid";
import { ActiveDeviceUser, Device, DeviceUser } from '@prisma/client';


interface MonitoringClientProps {
  allActiveDevice: (ActiveDeviceUser & { device: Device, user: DeviceUser })[];
  allInactiveDevice: Device[];

}


export const MonitoringClient: React.FC<MonitoringClientProps> = ({
  allActiveDevice,
  allInactiveDevice,
}) => {


  const { socket } = useSocket();


  const refresh = async () => {
    // You might want to implement a refresh logic here
    // For now, it's an empty function to fix the type error
  };

  const handleLogoutAll = () => {
    allActiveDevice.forEach((device) => {
      logoutUser(device.userId, device.deviceId).then(() => {
        toast.success("All devices have been logged out successfully");
        if (socket) {
          socket.emit("logout-user", { deviceId: device.deviceId, userId: device.userId });
        }
      });
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">

          <Heading
            title={`Monitoring (${allActiveDevice.length + allInactiveDevice.length})`}
            description="Monitor active and inactive devices"
          />
        </div>
        <button
          onClick={handleLogoutAll}
          disabled={allActiveDevice.length === 0}
          className={cn(
            buttonVariants({ variant: "destructive" }),
            'text-xs md:text-sm bg-[#C9121F] hover:bg-red-700'
          )}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout All
        </button>
      </div>
      <Separator />

      <div className="grid gap-4">
        <MonitoringStats
          activeCount={allActiveDevice.length}
          inactiveCount={allInactiveDevice.length}
        />

        <DeviceGrid
          activeDevices={allActiveDevice}
          inactiveDevices={allInactiveDevice}
          onRefresh={refresh}

        />
      </div>
    </div>
  );
};
