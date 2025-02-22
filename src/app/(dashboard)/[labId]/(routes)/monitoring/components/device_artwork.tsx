"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState, useTransition } from "react"
import toast from "react-hot-toast"
import { motion } from "framer-motion"

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


interface DeviceArtworkProps extends React.HTMLAttributes<HTMLDivElement> {
  labId: String;
  device: Device,
  user?: DeviceUser,
  aspectRatio?: "portrait" | "square";
  width?: number;
  height?: number;

  onChanged: () => void;
}

export function DeviceArtwork({
  labId,
  device,
  user,
  aspectRatio = "portrait",
  width,
  height,
  onChanged,
  className,

  ...props
}: DeviceArtworkProps) {
  const router = useRouter()

  const { socket } = useSocket();

  const handleLogout = async () => {
    if (device && user) {
      logoutUser(user.id, device.id).then((message) => {
        toast.success(message.success)
        if (socket) {
          socket.emit("logout-user", { deviceId: device.id, userId: user.id });
        }
        onChanged()
      })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
      className={cn("group relative rounded-xl p-2 transition-all hover:bg-accent",
        className)}
      {...(props as any)}
    >
      <ContextMenu>
        <ContextMenuTrigger>
          <div className="relative">
            {/* Monitor Frame */}
            <div className={cn(
              "relative w-48 h-32 bg-gray-800 rounded-lg p-2",
              "before:absolute before:content-[''] before:w-20 before:h-4 before:bg-gray-700",
              "before:bottom-[-0.5rem] before:left-1/2 before:transform before:-translate-x-1/2",
              "before:rounded-b-lg",
              "after:absolute after:content-[''] after:w-24 after:h-1",
              "after:bottom-[-0.75rem] after:left-1/2 after:transform after:-translate-x-1/2",
              "after:bg-gray-600 after:rounded-full"
            )}>
              {/* Screen */}
              <div className={cn(
                "w-full h-full rounded-sm relative overflow-hidden",
                "bg-gradient-to-br from-gray-900 to-gray-800",
                !device.isUsed && "border-2 border-primary/20",
                "shadow-[inset_0_0_12px_rgba(0,0,0,0.6)]"
              )}>
                {/* Screen Content */}
                <div className="absolute inset-0 p-2">
                  {!device.isUsed && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
                      <div className="w-3 h-3 rounded-full bg-red-500/80 animate-pulse mb-2" />
                      <span className="text-xs text-red-500 font-medium">OFFLINE</span>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-2 backdrop-blur-sm">
                    <p className="text-sm font-semibold text-gray-100 truncate">{device.name}</p>
                    {user && (
                      <>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-300 truncate">{user.firstName} {user.lastName}</p>
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        </div>
                      </>
                    )}
                  </div>
                </div>
                {/* Screen Glare */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
              </div>
            </div>
          </div>
        </ContextMenuTrigger>

        <ContextMenuContent className="w-56">

          <ContextMenuItem
            onClick={() => router.push(`/${labId}/monitoring/${device.id}/activitylogs`)}>
            <ClipboardList className="mr-2 h-4 w-4" />
            View Activity Logs
          </ContextMenuItem>

          <ContextMenuSeparator />
          <ContextMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </ContextMenuItem>
        </ContextMenuContent>

      </ContextMenu>

    </motion.div>
  )
}
