"use client"

import React, { useCallback, useMemo } from 'react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { getDeviceUserById } from "@/data/user"
import { DeviceUser } from "@prisma/client"
import { formatDistance } from "date-fns"
import { useEffect, useState, useTransition } from "react"
import { GraduationCap, UserCog, User, Users } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from 'lucide-react'

export type RecentUsersType = {
  id: string
  labId: string
  userId: string
  createdAt: Date
}


interface RecentUsersProps {
  data: RecentUsersType[]
}

export const RecentUsers: React.FC<RecentUsersProps> = React.memo(({ data }) => {
  const [users, setUsers] = useState<(DeviceUser & { createdAt: Date })[]>([]);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 20; // Show 5 users per page

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
      case 'guest':
        return {
          icon: User,
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

  // Optimize user data fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!data || data.length === 0) {
          setUsers([]);
          return;
        }

        const userPromises = data.map(async (recent) => {
          const user = await getDeviceUserById(recent.userId);
          if (user) {
            return {
              ...user,
              createdAt: recent.createdAt
            };
          }
          return null;
        });

        const userResults = await Promise.all(userPromises);
        const validUsers = userResults.filter((user): user is DeviceUser & { createdAt: Date } => user !== null);
        setUsers(validUsers);
        setError(null);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load user data');
      }
    };

    startTransition(() => {
      fetchData();
    });
  }, [data]);

  // Memoize pagination calculations
  const { currentUsers, totalPages } = useMemo(() => {
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    return {
      currentUsers: users.slice(indexOfFirstUser, indexOfLastUser),
      totalPages: Math.ceil(users.length / usersPerPage)
    };
  }, [users, currentPage, usersPerPage]);


  if (error) {
    return (
      <div className="p-4 text-center text-[#C9121F]">
        <p>{error}</p>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="bg-[#EAEAEB] dark:bg-[#1A1617] rounded-lg p-4 animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
        <p>No recent logins</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 space-y-2 pr-2 h-full">
        {currentUsers.map((user) => {
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
                      new Date(user.createdAt),
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
        <div className="flex justify-between items-center py-2 mt-2 border-t border-gray-200 dark:border-gray-700">
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