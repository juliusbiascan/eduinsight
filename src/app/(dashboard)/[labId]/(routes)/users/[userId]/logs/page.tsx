import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { ActivityLogsClient } from "./components/client"
import { formatActivities } from "@/data/activity"
import PageContainer from "@/components/layout/page-container"
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"

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
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-4'>
        <Heading
          title={`${user.firstName} ${user.lastName}'s Activity Logs`}
          description="View user activity and session history"
        />
        <Separator />
        <ActivityLogsClient 
          user={user}
          breakdown={breakdown}
          activeUserLogs={activeUserLogs}
        />
      </div>
    </PageContainer>
  )
}

export default ActivityLogsPage
