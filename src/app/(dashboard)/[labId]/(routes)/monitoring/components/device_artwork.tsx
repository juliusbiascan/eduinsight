"use client"

import { useRouter } from "next/navigation"
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
import { Device, DeviceUser } from "@prisma/client"
import { logoutUser } from "@/actions/logout"
import { useSocket } from "@/providers/socket-provider"
import {
  ClipboardList,
  LogOut
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
              "relative w-48 h-32 bg-gray-800 dark:bg-gray-900 rounded-lg p-2",
              "before:absolute before:content-[''] before:w-20 before:h-4 before:bg-gray-200 dark:before:bg-gray-700",
              "before:bottom-[-0.5rem] before:left-1/2 before:transform before:-translate-x-1/2",
              "before:rounded-b-lg",
              "after:absolute after:content-[''] after:w-24 after:h-1",
              "after:bottom-[-0.75rem] after:left-1/2 after:transform after:-translate-x-1/2",
              "after:bg-gray-300 dark:after:bg-gray-600 after:rounded-full"
            )}>
              {/* Screen */}
              <div className={cn(
                "w-full h-full rounded-sm relative overflow-hidden",
                "bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800",
                !device.isUsed && "border-2 border-primary/20",
                "shadow-[inset_0_0_12px_rgba(0,0,0,0.6)]"
              )}>
                {/* Screen Content */}
                <div className="absolute inset-0 p-2">
                  {!device.isUsed ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 dark:bg-black/80">
                      <div className="text-center space-y-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/80 animate-pulse mx-auto" />
                        <div className="space-y-1">
                          <span className="text-xs text-red-500 font-medium block">OFFLINE</span>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 truncate px-3">
                            {device.name}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="absolute inset-0">
                      <div className="absolute top-2 right-2 flex items-center gap-2 bg-green-500/10 dark:bg-green-500/20 px-2 py-1 rounded-full">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs text-green-600 dark:text-green-400 font-medium">ACTIVE</span>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 dark:from-black/60 via-transparent to-transparent" />
                      {user && (
                        <div className="absolute bottom-0 left-0 right-0 p-3 backdrop-blur-sm">
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate mb-1">{device.name}</p>
                          <div className="flex items-center gap-2 bg-black/20 dark:bg-white/10 p-1.5 rounded-md">
                            <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
                              <span className="text-xs font-bold text-primary">
                                {user.firstName[0]}{user.lastName[0]}
                              </span>
                            </div>
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                              {user.firstName} {user.lastName}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {device.isUsed && (
                  <div className="absolute inset-0 bg-primary/5 dark:bg-primary/10 animate-pulse-slow pointer-events-none" />
                )}
                {/* Screen Glare */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 dark:from-white/5 to-transparent pointer-events-none" />
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
