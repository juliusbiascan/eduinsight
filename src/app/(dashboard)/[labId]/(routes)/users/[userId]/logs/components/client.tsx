"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ActiveUserLogs, DeviceUser, Device } from "@prisma/client"
import { format } from "date-fns" // Removed formatDuration
import { formatDuration } from "@/lib/utils" // Added import from utils
import { Activity, Clock, Monitor } from "lucide-react"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible" // Added Collapsible imports

interface Breakdown {
  title: string;
  time: number;
  timestamp: string; // Added timestamp to match data structure
  subActivity: {
    title: string;
    time: number;
    timestamp: string; // Added timestamp if subactivities require it
  }[];
}

interface ActivityLogsClientProps {
  user: DeviceUser;
  breakdown: Breakdown[]; // Changed from activityLogs
  activeUserLogs: (ActiveUserLogs & {
    device: Device | null
  })[];
}

export const ActivityLogsClient = ({
  user,
  breakdown, // Changed from activityLogs
  activeUserLogs,
}: ActivityLogsClientProps) => {
  
  return (
    <div className="space-y-4">
      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activity">
            <Activity className="h-4 w-4 mr-2" />
            Activity Logs
          </TabsTrigger>
          <TabsTrigger value="sessions">
            <Clock className="h-4 w-4 mr-2" />
            Session History
          </TabsTrigger>
          
        </TabsList>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              {breakdown.map((activity, index) => ( // Added index for unique key
                <Collapsible key={`${activity.title}-${index}`} className="mb-4">
                  <CollapsibleTrigger className="flex justify-between items-center w-full text-left">
                    <p className="font-bold">{activity.title}</p>
                    <span>{formatDuration(activity.time)} minutes</span>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    {activity.subActivity.map((sub, subIndex) => (
                      <div key={`${sub.title}-${subIndex}`} className="ml-4">
                        <p>{sub.title} - {formatDuration(sub.time)} minutes</p>
                        <span className="text-xs text-muted-foreground">
                          {new Date(sub.timestamp).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </span>
                      </div>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              ))}
              {breakdown.length === 0 && (
                <p className="text-center text-muted-foreground">No activity logs found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              {activeUserLogs.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 border-b last:border-0"
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                      <Monitor className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium">
                        {session.device?.name || "Unknown Device"}
                      </p>
                      <div className="flex space-x-4 text-sm text-muted-foreground">
                        <span>ID: {session.deviceId}</span>
                        <span>•</span>
                        <span>MAC: {session.device?.devMACaddress}</span>
                        <span>•</span>
                        <span>Hostname: {session.device?.devHostname}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {format(new Date(session.createdAt), 'PPpp')}
                  </div>
                </div>
              ))}
              {activeUserLogs.length === 0 && (
                <p className="text-center text-muted-foreground">No session history found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
