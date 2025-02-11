"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getAllActiveUserDevice, getAllInactiveUserDevice } from "@/data/device";
import { logoutUser } from "@/actions/logout";
import { Button } from "@/components/ui/button";
import { Rainbow, Activity, Laptop, Users, LogOut } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Sparkles, Frown } from "lucide-react";
import { StatsCard } from '@/components/stats-card';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { DeviceArtwork } from "./device_artwork";
import toast from "react-hot-toast";
import { ActiveDeviceUser, Device } from "@prisma/client";
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '@/providers/socket-provider';
import { Heading } from '@/components/ui/heading';
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DeviceStatus {
  deviceId: string;
  status: 'online' | 'offline' | 'idle';
  lastActivity?: Date;
  batteryLevel?: number;
}

interface MonitoringClientProps {
  labId: string;
  initialStats?: {
    deviceStatuses: DeviceStatus[];
  };
}

interface DeviceFilter {
  status: string;
  sortBy: string;
  search: string;
}

export const MonitoringClient: React.FC<MonitoringClientProps> = ({ labId, initialStats }) => {
  const [allActiveDevice, setAllActiveDevice] = useState<ActiveDeviceUser[]>([]);
  const [allInactiveDevice, setAllInactiveDevice] = useState<Device[]>([]);
  const { socket } = useSocket();
  const [filters, setFilters] = useState<DeviceFilter>({
    status: "all",
    sortBy: "name",
    search: ""
  });
  const [deviceStatuses, setDeviceStatuses] = useState<Record<string, DeviceStatus>>(
    initialStats?.deviceStatuses.reduce((acc, status) => ({
      ...acc,
      [status.deviceId]: status
    }), {}) || {}
  );

  const refresh = useCallback(async () => {
    if (labId) {
      const activeDevices = await getAllActiveUserDevice(labId);
      if (activeDevices) setAllActiveDevice(activeDevices);

      const inactiveDevices = await getAllInactiveUserDevice(labId);
      if (inactiveDevices) setAllInactiveDevice(inactiveDevices);
    }
  }, [labId]);

  useEffect(() => {
    refresh();

    if (!socket) return;

    socket.on("refresh", () => {
      refresh();
    });

    socket.on("device-status-update", (status: DeviceStatus) => {
      setDeviceStatuses(prev => ({
        ...prev,
        [status.deviceId]: status
      }));
    });

    return () => {
      socket.off("refresh");
      socket.off("device-status-update");
    };

  }, [refresh, socket]);

  const handleLogoutAll = () => {
    allActiveDevice.forEach((activeDevice) => {
      logoutUser(activeDevice.userId, activeDevice.deviceId).then(() => {
        toast.success("All devices have been logged out successfully");
        if (socket) {
          socket.emit("logout-user", { deviceId: activeDevice.deviceId, userId: activeDevice.userId });
        }
      });
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 24
      }
    }
  };

  const filteredActiveDevices = useMemo(() => {
    return allActiveDevice
      
      .sort((a, b) => {
        const statusA = deviceStatuses[a.deviceId];
        const statusB = deviceStatuses[b.deviceId];

        switch (filters.sortBy) {
          
          case "status":
            return (statusA?.status || "offline").localeCompare(statusB?.status || "offline");
          case "lastActivity":
            const timeA = statusA?.lastActivity?.getTime() || 0;
            const timeB = statusB?.lastActivity?.getTime() || 0;
            return timeB - timeA; // Most recent first
          default:
            return 0;
        }
      });
  }, [allActiveDevice, filters, deviceStatuses]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4 px-2 sm:px-4"
    >
      <Card className="bg-[#EAEAEB] dark:bg-[#1A1617] backdrop-blur supports-[backdrop-filter]:bg-opacity-60">
        <CardContent className="p-2 sm:p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <Rainbow className="w-6 h-6 sm:w-8 sm:h-8 text-[#C9121F]" />
              <Heading
                title={`Monitoring (${allActiveDevice.length + allInactiveDevice.length})`}
                description="Monitor active and inactive devices"
                className="text-black dark:text-white text-sm sm:text-base"
              />
            </div>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleLogoutAll}
              disabled={allActiveDevice.length === 0}
              className="bg-[#C9121F] hover:bg-red-700 text-white text-xs sm:text-sm py-1 h-8 w-full sm:w-auto"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Logout All
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4 flex-wrap">
        <Input
          placeholder="Search devices..."
          value={filters.search}
          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          className="max-w-[300px]"
        />
        <Select
          value={filters.status}
          onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Devices</SelectItem>
            <SelectItem value="online">Online</SelectItem>
            <SelectItem value="offline">Offline</SelectItem>
            <SelectItem value="idle">Idle</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.sortBy}
          onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="status">Status</SelectItem>
            <SelectItem value="lastActivity">Last Activity</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <motion.div
        className="grid gap-2 sm:gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <StatsCard
            title="Active Devices"
            value={allActiveDevice.length}
            icon={<Activity className="h-4 w-4" />}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatsCard
            title="Inactive Devices"
            value={allInactiveDevice.length}
            icon={<Laptop className="h-4 w-4" />}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatsCard
            title="Total Devices"
            value={allActiveDevice.length + allInactiveDevice.length}
            icon={<Users className="h-4 w-4" />}
          />
        </motion.div>
        {/* Add more stats cards as needed */}
      </motion.div>

      <Tabs defaultValue="active" className="space-y-2 sm:space-y-4">
        <TabsList className="bg-[#EAEAEB] dark:bg-[#1A1617] p-1 w-full">
          <TabsTrigger
            value="active"
            className="flex-1 data-[state=active]:bg-[#C9121F] data-[state=active]:text-white text-xs sm:text-sm"
          >
            Active Devices
          </TabsTrigger>
          <TabsTrigger
            value="inactive"
            className="flex-1 data-[state=active]:bg-[#C9121F] data-[state=active]:text-white text-xs sm:text-sm"
          >
            Inactive Devices
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <Card className="bg-[#EAEAEB] dark:bg-[#1A1617] backdrop-blur supports-[backdrop-filter]:bg-opacity-60">
            <CardHeader className="pb-2 px-2 sm:px-4">
              <CardTitle className="text-sm sm:text-base flex items-center">
                <Heart className="h-4 w-4 text-[#C9121F] mr-2" />
                Active Devices
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <ScrollArea>
                <motion.div
                  className="flex space-x-2 sm:space-x-4 pb-4"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <AnimatePresence>
                    {filteredActiveDevices.length === 0 ? (
                      <motion.div
                        className="flex flex-col items-center justify-center w-full py-4 sm:py-8"
                        variants={itemVariants}
                        key="no-active-devices"
                      >
                        <Frown className="h-12 w-12 sm:h-16 sm:w-16 text-[#C9121F] mb-4" />
                        <p className="text-base sm:text-lg font-semibold text-black dark:text-white">No Active Devices</p>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">It&apos;s quiet here... too quiet.</p>
                      </motion.div>
                    ) : (
                      filteredActiveDevices.map((device) => (
                        <motion.div key={device.id} variants={itemVariants}>
                          <DeviceArtwork
                            labId={labId}
                            activeDevice={device}
                            deviceStatus={deviceStatuses[device.deviceId]}
                            className="w-[200px] sm:w-[250px]"
                            aspectRatio="portrait"
                            width={250}
                            height={330}
                            onChanged={refresh}
                          />
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </motion.div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inactive">
          <Card className="bg-[#EAEAEB] dark:bg-[#1A1617] backdrop-blur supports-[backdrop-filter]:bg-opacity-60">
            <CardHeader className="pb-2 px-2 sm:px-4">
              <CardTitle className="text-sm sm:text-base flex items-center">
                <Sparkles className="h-4 w-4 text-[#C9121F] mr-2" />
                Inactive Devices
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <ScrollArea>
                <div className="flex space-x-2 sm:space-x-4 pb-4">
                  {allInactiveDevice.length === 0 ? (
                    <motion.div
                      className="flex flex-col items-center justify-center w-full py-4 sm:py-8"
                      variants={itemVariants}
                    >
                      <Frown className="h-12 w-12 sm:h-16 sm:w-16 text-[#C9121F] mb-4" />
                      <p className="text-base sm:text-lg font-semibold text-black dark:text-white">No Inactive Devices</p>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">All devices are currently active.</p>
                    </motion.div>
                  ) : (
                    allInactiveDevice.map((device) => (
                      <DeviceArtwork
                        labId={labId}
                        key={device.id}
                        inactiveDevice={device}
                        className="w-[120px] sm:w-[150px]"
                        aspectRatio="square"
                        width={150}
                        height={150}
                        onChanged={refresh}
                      />
                    ))
                  )}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};
