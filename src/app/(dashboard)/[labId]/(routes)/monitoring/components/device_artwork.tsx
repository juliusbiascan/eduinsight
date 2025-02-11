"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState, useTransition } from "react"
import toast from "react-hot-toast"

import { cn } from "@/lib/utils"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { ActiveDeviceUser, Device, DeviceUser } from "@prisma/client"
import { getDeviceUserById } from "@/data/user"
import { getDeviceById } from "@/data/device"
import { logoutUser } from "@/actions/logout"
import { useSocket } from "@/providers/socket-provider"
import { 
  Search, 
  RefreshCcw, 
  Power, 
  ClipboardList, 
  Battery, 
  LogOut,
  Activity
} from "lucide-react"

interface DeviceStatus {
  status: 'online' | 'offline' | 'idle';
  lastActivity?: Date;
  batteryLevel?: number;
}

interface DeviceArtworkProps extends React.HTMLAttributes<HTMLDivElement> {
  labId: String;
  activeDevice?: ActiveDeviceUser;
  inactiveDevice?: Device;
  aspectRatio?: "portrait" | "square";
  width?: number;
  height?: number;
  onChanged: () => void;
  deviceStatus?: DeviceStatus;
}

export function DeviceArtwork({
  labId,
  activeDevice,
  inactiveDevice,
  aspectRatio = "portrait",
  width,
  height,
  onChanged,
  deviceStatus = { status: 'offline' },
  className,
  ...props
}: DeviceArtworkProps) {
  const router = useRouter()
  const [user, setUser] = useState<DeviceUser | null>(null)
  const [device, setDevice] = useState<Device | null>(null)
  const [isPending, startTransition] = useTransition()
  const { socket } = useSocket();

  useEffect(() => {
    const fetchData = async () => {
      if (activeDevice) {
        const fetchedUser = await getDeviceUserById(activeDevice.userId)
        setUser(fetchedUser)
      }
      const fetchedDevice = await getDeviceById(activeDevice ? activeDevice.deviceId : inactiveDevice ? inactiveDevice.id : '')
      setDevice(fetchedDevice)
    }
    startTransition(() => {
      fetchData()
    })
  }, [activeDevice, inactiveDevice])

  const handleLogout = async () => {
    if (activeDevice) {
      logoutUser(activeDevice.userId, activeDevice.deviceId).then((message) => {
        toast.success(message.success)
        if (socket) {
          socket.emit("logout-user", { deviceId: activeDevice.deviceId, userId: activeDevice.userId });
        }
        onChanged()
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'idle': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Online';
      case 'idle': return 'Idle';
      case 'offline': return 'Offline';
      default: return 'Unknown';
    }
  };

  return (
    <div className={cn("space-y-3 flex flex-col items-center relative", className)} {...props}>
      <div className="absolute top-2 right-2 flex items-center space-x-2">
        <div className={`h-3 w-3 rounded-full ${getStatusColor(deviceStatus.status)}`} />
        <span className="text-xs text-muted-foreground">
          {getStatusText(deviceStatus.status)}
        </span>
      </div>
      
      <ContextMenu>
        <ContextMenuTrigger>
          <div className="overflow-hidden rounded-md">
            {isPending ? (
              <Skeleton className="h-40 w-40" />
            ) : (
              <Image
                src={activeDevice ? "/preferences-desktop-display-blue.png" : "/preferences-desktop-display.png"}
                alt=""
                width={width}
                height={height}
                className={cn(
                  "h-auto w-auto object-cover transition-all hover:scale-105",
                  aspectRatio === "portrait" ? "aspect-[3/4]" : "aspect-square"
                )} 
              />
            )}
          </div>
        </ContextMenuTrigger>
        {!inactiveDevice && (
          <ContextMenuContent className="w-56">
            <ContextMenuItem onClick={() => router.push(`/${labId}/monitoring/${device?.id}`)}>
              <Search className="mr-2 h-4 w-4" />
              Inspect
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() => {
                if (socket) {
                  socket.emit("reboot", { deviceId: device?.id });
                }
              }}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Restart
            </ContextMenuItem>
            <ContextMenuItem onClick={() => {
              if (socket) {
                socket.emit("shutdown", { deviceId: device?.id });
              }
            }}>
              <Power className="mr-2 h-4 w-4" />
              Shutdown
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem 
            onClick={() => router.push(`/${labId}/monitoring/${device?.id}/activitylogs`)}>
              <ClipboardList className="mr-2 h-4 w-4" />
              View Activity Logs
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem>
              <Battery className="mr-2 h-4 w-4" />
              System Info
            </ContextMenuItem>
            <ContextMenuItem>
              <Activity className="mr-2 h-4 w-4" />
              Performance
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </ContextMenuItem>
          </ContextMenuContent>
        )}
      </ContextMenu>

      <div className="space-y-1 text-sm text-center">
        {isPending ? (
          <Skeleton className="h-4 w-40" />
        ) : (
          <h3 className="font-medium leading-none">{device?.name}</h3>
        )}
        {activeDevice && (
          isPending ? (
            <Skeleton className="h-4 w-30" />
          ) : (
            <p className="text-xs text-muted-foreground">{user?.firstName} {user?.lastName}</p>
          )
        )}
        {deviceStatus.lastActivity && (
          <p className="text-xs text-muted-foreground">
            Last active: {new Date(deviceStatus.lastActivity).toLocaleString()}
          </p>
        )}
        {deviceStatus.batteryLevel !== undefined && (
          <p className="text-xs text-muted-foreground">
            Battery: {deviceStatus.batteryLevel}%
          </p>
        )}
      </div>
    </div>
  )
}