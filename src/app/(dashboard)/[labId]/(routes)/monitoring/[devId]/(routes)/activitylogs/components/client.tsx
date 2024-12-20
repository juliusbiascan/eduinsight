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

interface ActivityLogsClientProps {
  userId: string;
  deviceId: string;
  labId: string;
}

export const ActivityLogsClient: React.FC<ActivityLogsClientProps> = ({
  userId,
  deviceId,
  labId
}) => {
  const [activities, setActivities] = useState<Breakdown[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const { socket, isConnected } = useSocket()
  const [selectedDate, setSelectedDate] = useState<string>("all")
  const [error, setError] = useState<string | null>(null)

  const fetchUpdates = useCallback(async () => {
    try {
      let allActivities;
      if (selectedDate === "all") {
        allActivities = await getAllActivities(labId, userId, deviceId)
      } else {
        allActivities = await getActivitiesByDay(labId, userId, deviceId, selectedDate);
      }
      console.log("Fetched activities:", allActivities)

      const formattedActivities = await formatActivities(allActivities);
      console.log("Formatted activities:", formattedActivities)
      setActivities(formattedActivities);

      const eventData = await getEvents(labId, userId, deviceId);
      console.log("Fetched events:", eventData)
      setEvents(eventData);

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
    <div className="p-2 sm:p-4 space-y-4 bg-gradient-to-br from-pink-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg shadow-sm">
        <Heading
          title="Activity Logs"
          description="View Activity Logs of this User"
        />
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

      <Separator />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="justify-start bg-white dark:bg-gray-800 rounded-full p-1 shadow-sm overflow-x-auto">
          <TabsTrigger value="overview" className="rounded-full">Overview</TabsTrigger>
          <TabsTrigger value="detailed" className="rounded-full">Detailed View</TabsTrigger>
          <TabsTrigger value="calendar" className="rounded-full">Calendar View</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <Card className="overflow-hidden border border-pink-200 dark:border-pink-700 shadow-sm">
            <CardHeader className="pb-2 bg-gradient-to-r from-pink-100 to-blue-100 dark:from-pink-900 dark:to-blue-900">
              <CardTitle className="text-sm sm:text-base flex items-center">
                <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-pink-500 dark:text-pink-400 mr-2" /> Activity Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              {activities.length > 0 ? (
                activities.map((activity, index) => (
                  <div key={index} className="flex justify-between items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                    <span className="font-medium">{activity.title}</span>
                    <span>{Math.floor(activity.time / 60)}h {activity.time % 60}m</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">No activities found for the selected date.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="detailed" className="space-y-4">
          <Card className="overflow-hidden border border-blue-200 dark:border-blue-700 shadow-sm">
            <CardHeader className="pb-2 bg-gradient-to-r from-blue-100 to-pink-100 dark:from-blue-900 dark:to-pink-900">
              <CardTitle className="text-sm sm:text-base flex items-center">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500 dark:text-blue-400 mr-2" /> Detailed Activity Logs
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              {activities.length > 0 ? (
                activities.map((activity, index) => (
                  <details key={index} className="mb-2">
                    <summary className="font-medium cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                      {activity.title} - {Math.floor(activity.time / 60)}h {activity.time % 60}m
                    </summary>
                    <ul className="ml-4">
                      {activity.subActivity.map((subActivity, subIndex) => (
                        <li key={subIndex} className="p-1">
                          {subActivity.title} - {Math.floor(subActivity.time / 60)}h {subActivity.time % 60}m
                        </li>
                      ))}
                    </ul>
                  </details>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">No detailed activities found for the selected date.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="calendar" className="space-y-4">
          <Card className="overflow-hidden border border-green-200 dark:border-green-700 shadow-sm">
            <CardHeader className="pb-2 bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900">
              <CardTitle className="text-sm sm:text-base flex items-center">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 dark:text-green-400 mr-2" /> Calendar View
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              {events.length > 0 ? (
                events.map((event, index) => (
                  <div key={index} className="flex justify-between items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                    <span className="font-medium">{event.start}</span>
                    <span>{event.title}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">No calendar events found.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}