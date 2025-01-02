"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { useSocket } from "@/providers/socket-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Clock, Calendar } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Breakdown, formatActivities, getActivitiesByDay, getAllActivities, getEvents, Event } from '@/data/activity';
import { DeviceUser } from "@prisma/client"
import { formatDuration } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown } from "lucide-react"

interface ActivityLogsClientProps {
  userId: string;
  deviceId: string;
  labId: string;
  user: DeviceUser;
}

export const ActivityLogsClient: React.FC<ActivityLogsClientProps> = ({
  userId,
  deviceId,
  labId,
  user
}) => {
  const [activities, setActivities] = useState<Breakdown[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const { socket, isConnected } = useSocket()
  const [selectedDate, setSelectedDate] = useState<string>("all")
  const [error, setError] = useState<string | null>(null)

  const fetchUpdates = useCallback(async () => {
    try {
      if (selectedDate === "all") {
        const allActivities = await getAllActivities(labId, userId, deviceId)
        console.log("Fetched activities:", allActivities)

        const formattedActivities = await formatActivities(allActivities)
        console.log("Formatted activities:", formattedActivities)
        setActivities(formattedActivities)
      } else {
        const breakdownActivities = await getActivitiesByDay(labId, userId, deviceId, selectedDate)
        console.log("Fetched activities:", breakdownActivities)
        setActivities(breakdownActivities)
      }

      const eventData = await getEvents(labId, userId, deviceId)
      console.log("Fetched events:", eventData)
      setEvents(eventData)

      setError(null)
    } catch (err) {
      console.error("Error fetching updates:", err)
      setError("Failed to fetch activity data. Please try again later.")
    }
  }, [selectedDate, labId, userId, deviceId]);

  useEffect(() => {
    if (!socket || !isConnected) {
      return;
    }
    fetchUpdates();
    socket.emit("join-server", deviceId);
    socket.on('activity-update', fetchUpdates)
    return () => {
      socket.off('activity-update', fetchUpdates)
    }
  }, [isConnected, socket, fetchUpdates, deviceId])

  return (
    <div className="flex flex-col lg:flex-row gap-4 p-2 sm:p-4">
      <div className="w-full lg:w-3/4 space-y-4">
        <Card className="bg-white dark:bg-[#1A1617] backdrop-blur supports-[backdrop-filter]:bg-opacity-60">
          <CardContent className="p-4">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Activity className="w-8 h-8 text-[#C9121F]" />
                  <div>
                    <Heading
                      title={`${user.firstName} ${user.lastName} - ${user.schoolId} - Activity Logs `}
                      description={`View activity log of this user`}
                      className="text-black dark:text-white"
                    />
                  
                  </div>
                </div>
                <Select onValueChange={setSelectedDate} defaultValue={selectedDate}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Activities</SelectItem>
                    {events.map((event, index) => (
                      <SelectItem key={index} value={event.start}>{event.start}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Card className="bg-red-50 border-red-200 dark:bg-red-900/20">
            <CardContent className="p-4 text-red-700 dark:text-red-400">
              <strong className="font-bold">Error:</strong>
              <span className="ml-2">{error}</span>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
          {activities.slice(0, 3).map((activity, index) => (
            <Card key={index} className="bg-gradient-to-br from-white to-gray-100 dark:from-gray-800 dark:to-gray-900">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  {activity.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatDuration(activity.time)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="bg-[#EAEAEB] dark:bg-[#1A1617] p-1">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-[#C9121F] data-[state=active]:text-white"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="detailed"
              className="data-[state=active]:bg-[#C9121F] data-[state=active]:text-white"
            >
              Detailed View
            </TabsTrigger>
            <TabsTrigger
              value="calendar"
              className="data-[state=active]:bg-[#C9121F] data-[state=active]:text-white"
            >
              Calendar View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
          <Card className="h-full bg-white dark:bg-[#1A1617] backdrop-blur supports-[backdrop-filter]:bg-opacity-60">
          <CardHeader className="pb-2 border-b">
            <CardTitle className="text-base flex items-center">
              <Clock className="h-4 w-4 text-[#C9121F] mr-2" />
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            {activities.slice(0, 5).map((activity, index) => (
              <div key={index} className="flex justify-between items-center p-2 border-b last:border-0">
                <div className="flex flex-col">
                  <span className="text-sm">{activity.title}</span>
                  <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {formatDuration(activity.time)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
          </TabsContent>

          <TabsContent value="detailed" className="space-y-4">
            <Card className="bg-white dark:bg-[#1A1617] backdrop-blur supports-[backdrop-filter]:bg-opacity-60">
              <CardHeader className="pb-2 border-b">
                <CardTitle className="text-base flex items-center">
                  <Activity className="h-4 w-4 text-[#C9121F] mr-2" />
                  Detailed Activity Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {activities.length > 0 ? (
                  <div className="space-y-4">
                    {activities.map((activity, index) => (
                      <Collapsible key={index}>
                        <CollapsibleTrigger className="w-full">
                          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            <div className="flex items-center space-x-3">
                              <div className="h-2 w-2 rounded-full bg-[#C9121F]" />
                              <span className="font-medium">{activity.title}</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className="text-sm text-muted-foreground">
                                {formatDuration(activity.time)}
                              </span>
                              <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 collapsible-open:rotate-180" />
                            </div>
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="mt-2 rounded-lg border dark:border-gray-700">
                            <div className="grid grid-cols-12 gap-4 p-3 text-sm font-medium text-muted-foreground border-b dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                              <span className="col-span-6">Application</span>
                              <span className="col-span-3">Time</span>
                              <span className="col-span-3 text-right">Duration</span>
                            </div>
                            <div className="divide-y dark:divide-gray-700">
                              {activity.subActivity.map((sub, subIndex) => (
                                <div 
                                  key={subIndex} 
                                  className="grid grid-cols-12 gap-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                >
                                  <span className="col-span-6 text-sm truncate">
                                    {sub.title}
                                  </span>
                                  <span className="col-span-3 text-sm text-muted-foreground">
                                    {sub.timestamp}
                                  </span>
                                  <span className="col-span-3 text-sm text-right text-muted-foreground">
                                    {formatDuration(sub.time)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p>No detailed activities found for the selected date.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-4">
            <Card className="bg-white dark:bg-[#1A1617] backdrop-blur supports-[backdrop-filter]:bg-opacity-60">
              <CardHeader className="pb-2 border-b">
                <CardTitle className="text-base flex items-center">
                  <Calendar className="h-4 w-4 text-[#C9121F] mr-2" />
                  Activity Calendar
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {events.length > 0 ? (
                  <div className="space-y-2">
                    {events.map((event, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-4 p-3 rounded-lg border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="min-w-[100px] text-sm font-medium">
                          {new Date(event.start).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">{event.title}</div>
                          <div className="text-xs text-muted-foreground">
                            Total activity time
                          </div>
                        </div>
                        <div className="h-2 w-2 rounded-full bg-[#C9121F]" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p>No calendar events found for this period.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <div className="w-full lg:w-1/4">
        <Card className="h-full bg-white dark:bg-[#1A1617] backdrop-blur supports-[backdrop-filter]:bg-opacity-60">
          <CardHeader className="pb-2 border-b">
            <CardTitle className="text-base flex items-center">
              <Clock className="h-4 w-4 text-[#C9121F] mr-2" />
              User Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <div>
              <div className="text-sm font-medium">School ID</div>
              <div className="text-sm text-muted-foreground">{user.schoolId}</div>
            </div>
            <div>
              <div className="text-sm font-medium">Email</div>
              <div className="text-sm text-muted-foreground">{user.email}</div>
            </div>
            <div>
              <div className="text-sm font-medium">Course & Year</div>
              <div className="text-sm text-muted-foreground">{user.course} - {user.yearLevel} Year</div>
            </div>
            <div>
              <div className="text-sm font-medium">Contact</div>
              <div className="text-sm text-muted-foreground">{user.contactNo}</div>
            </div>
          </CardContent>
        </Card>
        
      </div>
    </div>
  );
}