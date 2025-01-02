import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { ActivityLogsClient } from "./components/client"
import { formatActivities } from "@/data/activity"

interface ActivityLogsPageProps {
  params: {
    labId: string
    userId: string
  }
}

const ActivityLogsPage = async ({ params }: ActivityLogsPageProps) => {
  const session = await auth()

  if (!session) {
    redirect("/auth/login")
  }

  const user = await db.deviceUser.findUnique({
    where: {
      id: params.userId,
    },
  })

  if (!user) {
    redirect('/')
  }

  // Fetch both activity logs and active user logs
  const [breakdown, activeUserLogs] = await Promise.all([
    formatActivities(await db.activityLogs.findMany({
      where: {
        userId: params.userId,
        labId: params.labId,
      },
      orderBy: {
        createdAt: 'desc'
      }
    })), // Fetch and format activities into breakdown
    db.activeUserLogs.findMany({
      where: {
        userId: params.userId,
        labId: params.labId,
      },
      include: {
        device: true 
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  ]);

  return (
    <div className="flex-col">
      <div className="flex-1 p-8 pt-6 space-y-4">
        <ActivityLogsClient 
          user={user}
          breakdown={breakdown} // Passed breakdown instead of activityLogs
          activeUserLogs={activeUserLogs}
        />
      </div>
    </div>
  )
}

export default ActivityLogsPage
