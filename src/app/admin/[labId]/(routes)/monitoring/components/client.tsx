"use client";

import React, { useState, useEffect, useCallback } from 'react';
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

interface MonitoringClientProps {
  labId: string;
}

export const MonitoringClient: React.FC<MonitoringClientProps> = ({ labId }) => {
  const [allActiveDevice, setAllActiveDevice] = useState<ActiveDeviceUser[]>([]);
  const [allInactiveDevice, setAllInactiveDevice] = useState<Device[]>([]);
  const { socket } = useSocket();

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

    return () => {
      socket.off("refresh");
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      <Card className="bg-[#EAEAEB] dark:bg-[#1A1617] backdrop-blur supports-[backdrop-filter]:bg-opacity-60">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Rainbow className="w-8 h-8 text-[#C9121F]" />
              <Heading
                title={`Monitoring (${allActiveDevice.length + allInactiveDevice.length})`}
                description="Monitor active and inactive devices"
                className="text-black dark:text-white"
              />
            </div>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleLogoutAll}
              disabled={allActiveDevice.length === 0}
              className="bg-[#C9121F] hover:bg-red-700 text-white text-sm py-1 h-8"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Logout All
            </Button>
          </div>
        </CardContent>
      </Card>

      <motion.div
        className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
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

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList className="bg-[#EAEAEB] dark:bg-[#1A1617] p-1">
          <TabsTrigger
            value="active"
            className="data-[state=active]:bg-[#C9121F] data-[state=active]:text-white"
          >
            Active Devices
          </TabsTrigger>
          <TabsTrigger
            value="inactive"
            className="data-[state=active]:bg-[#C9121F] data-[state=active]:text-white"
          >
            Inactive Devices
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <Card className="bg-[#EAEAEB] dark:bg-[#1A1617] backdrop-blur supports-[backdrop-filter]:bg-opacity-60">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center">
                <Heart className="h-4 w-4 text-[#C9121F] mr-2" />
                Active Devices
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <ScrollArea>
                <motion.div
                  className="flex space-x-4 pb-4"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <AnimatePresence>
                    {allActiveDevice.length === 0 ? (
                      <motion.div
                        className="flex flex-col items-center justify-center w-full py-8"
                        variants={itemVariants}
                        key="no-active-devices"
                      >
                        <Frown className="h-16 w-16 text-[#C9121F] mb-4" />
                        <p className="text-lg font-semibold text-black dark:text-white">No Active Devices</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">It&apos;s quiet here... too quiet.</p>
                      </motion.div>
                    ) : (
                      allActiveDevice.map((device) => (
                        <motion.div key={device.id} variants={itemVariants}>
                          <DeviceArtwork
                            labId={labId}
                            activeDevice={device}
                            className="w-[250px]"
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
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center">
                <Sparkles className="h-4 w-4 text-[#C9121F] mr-2" />
                Inactive Devices
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <ScrollArea>
                <div className="flex space-x-4 pb-4">
                  {allInactiveDevice.length === 0 ? (
                    <motion.div
                      className="flex flex-col items-center justify-center w-full py-8"
                      variants={itemVariants}
                    >
                      <Frown className="h-16 w-16 text-[#C9121F] mb-4" />
                      <p className="text-lg font-semibold text-black dark:text-white">No Inactive Devices</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">All devices are currently active.</p>
                    </motion.div>
                  ) : (
                    allInactiveDevice.map((device) => (
                      <DeviceArtwork
                        labId={labId}
                        key={device.id}
                        inactiveDevice={device}
                        className="w-[150px]"
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
