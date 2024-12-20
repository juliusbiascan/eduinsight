"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Heading } from "@/components/ui/heading"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ActivityLogs, ActiveUserLogs, DeviceUser, Device } from "@prisma/client"
import { format } from "date-fns"
import { Activity, Clock, Monitor } from "lucide-react"

interface ActivityLogsClientProps {
  user: DeviceUser;
  activityLogs: ActivityLogs[];
  activeUserLogs: (ActiveUserLogs & {
    device: Device | null
  })[];
}

export const ActivityLogsClient = ({
  user,
  activityLogs,
  activeUserLogs
}: ActivityLogsClientProps) => {
  return (
    <div className="space-y-4">
      <Card className="bg-[#EAEAEB] dark:bg-[#1A1617] backdrop-blur supports-[backdrop-filter]:bg-opacity-60">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Heading
              title={`${user.firstName} ${user.lastName}'s Activity Logs`}
              description="View user activity and session history"
            />
          </div>
        </CardHeader>
      </Card>

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
              {activityLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-4 border-b last:border-0"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{log.title}</p>
                    <p className="text-sm text-gray-500">Memory Usage: {log.memoryUsage}MB</p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {format(new Date(log.createdAt), 'PPpp')}
                  </div>
                </div>
              ))}
              {activityLogs.length === 0 && (
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
