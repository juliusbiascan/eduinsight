"use client"

import React, { useState, useEffect } from 'react'
import { useSocket } from '@/providers/socket-provider'
import { Heading } from "@/components/ui/heading"
import { Laptop, Zap, Users, Search } from "lucide-react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ApiList } from '@/components/ui/api-list'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Device, ActiveDeviceUser, DeviceUser, ActiveUserLogs, PowerMonitoringLogs } from '@prisma/client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface DeviceWithActiveUsers extends Device {
  activeUsers: (ActiveDeviceUser & {
    user: DeviceUser
  })[];
  activeUserLogs: (ActiveUserLogs & {
    user: DeviceUser
  })[];
  powerMonitoringLogs: PowerMonitoringLogs[];
}

interface DeviceClientProps {
  devices: DeviceWithActiveUsers[]
}

export const DeviceClient: React.FC<DeviceClientProps> = ({
  devices: initialDevices
}) => {
  const [devices, setDevices] = useState<DeviceWithActiveUsers[]>(initialDevices);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [filteredDevices, setFilteredDevices] = useState<DeviceWithActiveUsers[]>(initialDevices);
  const [selectedDevice, setSelectedDevice] = useState<DeviceWithActiveUsers | null>(null);
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    socket.on('refresh-power-status', () => {
      // Fetch updated device data from your API
      fetch(`/api/${devices[0]?.labId}/devices`)
        .then(res => res.json())
        .then(data => {
          setDevices(data);
        });
    });

    return () => {
      socket.off('refresh-power-status');
    };
  }, [socket, devices]);

  useEffect(() => {
    const filtered = devices.filter(device => {
      const matchesSearch = device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          device.devHostname.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "all" ? true :
        statusFilter === "online" ? device.activeUsers.length > 0 :
        statusFilter === "offline" ? device.activeUsers.length === 0 :
        statusFilter === "archived" ? device.isArchived : true;

      return matchesSearch && matchesStatus;
    });

    setFilteredDevices(filtered);
  }, [devices, searchQuery, statusFilter]);

  const getDeviceStatus = (device: DeviceWithActiveUsers) => {
    return device.activeUsers.length > 0 ? 'online' : 'offline';
  };

  const getPowerState = (pm_status: string) => {
    switch (pm_status) {
      case "0": return "System Sleep";
      case "1": return "System Resuming";
      case "2": return "AC Power (Charging)";
      case "3": return "Battery Power";
      case "4": return "Shutting Down";
      case "5": return "System Locked";
      case "6": return "System Unlocked";
      default: return "Unknown State";
    }
  };

  const getPowerBadgeVariant = (pm_status: string): "default" | "secondary" | "success" | null | undefined => {
    switch (pm_status) {
      case "0": return "secondary";  // Sleep
      case "1": return "secondary";  // Resuming
      case "2": return "success";    // AC Power
      case "3": return "secondary";  // Battery
      case "4": return "default";    // Shutting Down
      case "5": return "secondary";  // Locked
      case "6": return "success";    // Unlocked
      default: return "secondary";
    }
  };

  const getSortedSessionLogs = (logs: (ActiveUserLogs & { user: DeviceUser })[]) => {
    return [...logs].sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  };

  const getLastUsedInfo = (logs: (ActiveUserLogs & { user: DeviceUser })[]) => {
    if (logs.length === 0) return null;
    const lastLog = logs[0]; // Already sorted by createdAt desc
    const timeAgo = new Date(lastLog.createdAt).getTime();
    const now = new Date().getTime();
    const diffInHours = Math.floor((now - timeAgo) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return {
        user: lastLog.user,
        timeAgo: diffInHours === 0 ? 'Less than an hour ago' : `${diffInHours} hours ago`
      };
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    return {
      user: lastLog.user,
      timeAgo: `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`
    };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4 px-4 sm:px-0"
    >
      <Card className="bg-[#EAEAEB] dark:bg-[#1A1617] backdrop-blur supports-[backdrop-filter]:bg-opacity-60">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Laptop className="w-6 h-6 sm:w-8 sm:h-8 text-[#C9121F]" />
                <Heading
                  title={`Devices (${filteredDevices.length})`}
                  description="Manage devices for your laboratory"
                  className="text-black dark:text-white text-sm sm:text-base"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search devices..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Devices</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {filteredDevices.map((device) => (
          <Card 
            key={device.id}
            className="bg-white dark:bg-[#1A1617] hover:shadow-lg transition-shadow"
          >
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Laptop className="w-4 h-4 sm:w-5 sm:h-5 text-[#C9121F]" />
                    <h3 className="font-semibold text-sm sm:text-base">{device.name}</h3>
                  </div>
                  <Badge 
                    variant={getDeviceStatus(device) === 'online' ? 'success' : 'secondary'}
                    className="text-xs"
                  >
                    {getDeviceStatus(device)}
                  </Badge>
                </div>
                <div className="text-xs sm:text-sm space-y-1 text-muted-foreground">
                  <p>Hostname: {device.devHostname}</p>
                  <p>Status: {device.isArchived ? 'Archived' : 'Active'}</p>
                  {device.powerMonitoringLogs?.[0] && (
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={getPowerBadgeVariant(device.powerMonitoringLogs[0].pm_status)}
                      >
                        {getPowerState(device.powerMonitoringLogs[0].pm_status)}
                      </Badge>
                      <span className="text-xs">
                        Last updated: {new Date(device.powerMonitoringLogs[0].createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mt-2">
                    <div className="flex flex-col gap-1">
                      {device.activeUsers.length > 0 ? (
                        <>
                          <Badge variant="success" className="text-xs">
                            In Use
                          </Badge>
                          <span className="text-xs">
                            {device.activeUsers[0].user.firstName.charAt(0)}. {device.activeUsers[0].user.lastName}
                          </span>
                        </>
                      ) : (
                        <>
                          <Badge variant="secondary" className="text-xs w-fit">
                            Idle
                          </Badge>
                          {getLastUsedInfo(device.activeUserLogs) && (
                            <span className="text-xs text-muted-foreground">
                              Last used by {getLastUsedInfo(device.activeUserLogs)?.user.firstName}{' '}
                              {getLastUsedInfo(device.activeUserLogs)?.user.lastName}{' '}
                              <span className="italic">
                                ({getLastUsedInfo(device.activeUserLogs)?.timeAgo})
                              </span>
                            </span>
                          )}
                        </>
                      )}
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="w-full sm:w-auto text-xs sm:text-sm"
                          onClick={() => setSelectedDevice(device)}
                        >
                          <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                          View Sessions
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Device Sessions - {device.name}</DialogTitle>
                        </DialogHeader>
                        <Tabs defaultValue="active" className="w-full">
                          <TabsList>
                            <TabsTrigger value="active">Active Sessions</TabsTrigger>
                            <TabsTrigger value="history">Session History</TabsTrigger>
                            
                          </TabsList>
                          <TabsContent value="active">
                            <div className="space-y-4">
                              {device.activeUsers.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No active sessions</p>
                              ) : (
                                device.activeUsers.map((session) => (
                                  <div 
                                    key={session.id} 
                                    className="border p-3 rounded-lg"
                                  >
                                    <p className="font-medium">{session.user.firstName} {session.user.lastName}</p>
                                    <p className="text-sm text-muted-foreground">{session.user.schoolId}</p>
                                    <p className="text-sm text-muted-foreground">{session.user.course} - {session.user.yearLevel}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Started: {new Date(session.createdAt).toLocaleString()}
                                    </p>
                                  </div>
                                ))
                              )}
                            </div>
                          </TabsContent>
                          <TabsContent value="history">
                            <div className="space-y-4">
                              {device.activeUserLogs.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No session history</p>
                              ) : (
                                <div className="border rounded-lg overflow-hidden">
                                  <div className="divide-y max-h-[400px] overflow-y-auto">
                                    {getSortedSessionLogs(device.activeUserLogs).map((log) => (
                                      <div 
                                        key={log.id} 
                                        className="p-4 hover:bg-muted/50 transition-colors"
                                      >
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                          <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                              <Users className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                            <div>
                                              <p className="font-medium">{log.user.firstName} {log.user.lastName}</p>
                                              <p className="text-sm text-muted-foreground">{log.user.schoolId}</p>
                                            </div>
                                          </div>
                                          <div className="flex flex-col sm:items-end gap-1">
                                            <Badge variant="outline" className="whitespace-nowrap">
                                              {new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString()}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">
                                              {log.user.course} - {log.user.yearLevel}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </TabsContent>
                        </Tabs>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-white dark:bg-[#1A1617] backdrop-blur supports-[backdrop-filter]:bg-opacity-60">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center space-x-3 mb-4 sm:mb-5">
            <div className="p-1.5 sm:p-2 rounded-md bg-muted">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-[#C9121F]" />
            </div>
            <div>
              <h3 className="font-semibold text-sm sm:text-base">API Reference</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Available endpoints for device management
              </p>
            </div>
          </div>
          <ApiList entityName="devices" entityIdName="deviceId" />
        </CardContent>
      </Card>
    </motion.div>
  )
}