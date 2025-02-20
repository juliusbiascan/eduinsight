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
import { Skeleton } from './ui/skeleton';

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
      <div className='space-y-8'>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className='flex items-center'>
              <Skeleton className='h-9 w-9 rounded-full' /> {/* Avatar */}
              <div className='ml-4 space-y-1'>
                <Skeleton className='h-4 w-[120px]' /> {/* Name */}
                <Skeleton className='h-4 w-[160px]' /> {/* Email */}
              </div>
              <Skeleton className='ml-auto h-4 w-[80px]' /> {/* Amount */}
            </div>
          ))}
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
    <div className="h-full">
      <ScrollArea className="h-full">
        <div className='space-y-8'>
          {sortedData.map((data) => {
            const { user, device } = data;
            const { icon: RoleIcon, color: roleColor } = getRoleIcon(user.role);

            return (

                <div key={user.id} className='flex items-center px-4'>
                  <div className="relative">
                    <Avatar className="h-8 w-8 ring-1 ring-offset-1 ring-[#C9121F] dark:ring-[#C9121F]">
                      <AvatarImage
                        src={"/default-avatar.png"}
                        alt={`${user.firstName} ${user.lastName}`}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-[#C9121F] text-white text-xs">
                        {user.firstName[0]}{user.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 bg-white dark:bg-[#1A1617] rounded-full p-[2px] shadow-md">
                      <RoleIcon className={`h-3 w-3 ${roleColor}`} />
                    </div>
                  </div>

                  <div className='ml-4 space-y-1'>
                    <p className='text-sm font-medium leading-none'> {user.firstName} {user.lastName}</p>
                    <p className={`text-sm ${roleColor} mt-1 font-medium flex items-center`}>
                      {user.role}
                    </p>
                  </div>
                  <div className='ml-auto font-medium'>{formatDistance(
                    new Date(data.createdAt),
                    new Date(),
                    { addSuffix: true }
                  )}</div>
                </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
});

RecentUsers.displayName = 'RecentUsers';