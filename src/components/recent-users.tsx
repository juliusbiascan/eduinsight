"use client"

import React, { useCallback } from 'react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Device, DeviceUser } from "@prisma/client"
import { formatDistance } from "date-fns"
import { GraduationCap, UserCog, Users } from 'lucide-react'

export type RecentUsersType = {
  id: string
  labId: string
  userId: string
  createdAt: Date
  device: Device,
  user: DeviceUser,
}

interface RecentUsersProps {
  data: RecentUsersType[];
  isLoading: boolean;
}

export const RecentUsers: React.FC<RecentUsersProps> = React.memo(({ data, isLoading }) => {
  const getRoleIcon = useCallback((role: string) => {
    switch (role.toLowerCase()) {
      case 'student':
        return {
          icon: GraduationCap,
          color: 'text-[#C9121F]',
          bgColor: 'from-red-400 to-red-600'
        };
      case 'teacher':
        return {
          icon: UserCog,
          color: 'text-[#C9121F]',
          bgColor: 'from-red-400 to-red-600'
        };

      default:
        return {
          icon: Users,
          color: 'text-[#C9121F]',
          bgColor: 'from-red-400 to-red-600'
        };
    }
  }, []);

  // Sort data by date
  const sortedData = [...data].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (isLoading) {
    return (
      <div className="h-full overflow-hidden">
        <div className="space-y-2 pr-4">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="bg-[#EAEAEB] dark:bg-[#1A1617] rounded-lg p-3">
              <div className="flex items-center">
                <div className="relative">
                  <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
                  <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
                </div>
                <div className="ml-4 flex-grow space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse" />
                </div>
                <div className="w-20">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (sortedData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">No recent logins</p>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden">
      <ScrollArea className="h-full">
        <div className="space-y-2 pr-4">
          {sortedData.map((data) => {
            const { user, device } = data;
            const { icon: RoleIcon, color: roleColor } = getRoleIcon(user.role);
            
            return (
              <div
                key={user.id}
                className="bg-[#EAEAEB] dark:bg-[#1A1617] rounded-lg p-3 transition-all duration-200 hover:bg-opacity-80 dark:hover:bg-opacity-80"
              >
                <div className="flex items-center">
                  <div className="relative">
                    <Avatar className="h-12 w-12 ring-2 ring-offset-2 ring-[#C9121F] dark:ring-[#C9121F]">
                      <AvatarImage
                        src={"/default-avatar.png"}
                        alt={`${user.firstName} ${user.lastName}`}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-[#C9121F] text-white">
                        {user.firstName[0]}{user.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 bg-white dark:bg-[#1A1617] rounded-full p-1 shadow-md">
                      <RoleIcon className={`h-4 w-4 ${roleColor}`} />
                    </div>
                  </div>
                  <div className="ml-4 flex-grow">
                    <p className="text-lg font-semibold leading-none dark:text-white">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className={`text-sm ${roleColor} mt-1 font-medium flex items-center`}>
                      {user.role}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {device.name || 'Unknown Device'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-muted-foreground">
                      {formatDistance(
                        new Date(data.createdAt),
                        new Date(),
                        { addSuffix: true }
                      )}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
});

RecentUsers.displayName = 'RecentUsers';