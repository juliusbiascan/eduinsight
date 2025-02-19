"use client"

import React, { useCallback, useState } from 'react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Device, DeviceUser } from "@prisma/client"
import { formatDistance } from "date-fns"
import { GraduationCap, UserCog, Users, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from "@/components/ui/button"

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

const ITEMS_PER_PAGE = 17;

export const RecentUsers: React.FC<RecentUsersProps> = React.memo(({ data, isLoading }) => {
  const [currentPage, setCurrentPage] = useState(1);
  
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

  // Sort data by date before pagination
  const sortedData = [...data].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Calculate pagination using sortedData instead of data
  const totalPages = Math.ceil(sortedData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentItems = sortedData.slice(startIndex, endIndex);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(ITEMS_PER_PAGE)].map((_, index) => (
          <div key={index} className="bg-[#EAEAEB] dark:bg-[#1A1617] rounded-lg p-4">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
              </div>
              <div className="w-20">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (sortedData.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
        <p>No recent logins</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 space-y-2 pr-2">
        {currentItems.map((data) => {
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

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 mt-2 border-t border-gray-200 dark:border-gray-700">
          <Button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            variant="outline"
            size="sm"
            className="border-[#C9121F] text-[#C9121F] hover:bg-[#C9121F] hover:text-white"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <span className="text-sm font-medium dark:text-white">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            variant="outline"
            size="sm"
            className="border-[#C9121F] text-[#C9121F] hover:bg-[#C9121F] hover:text-white"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
});

RecentUsers.displayName = 'RecentUsers';