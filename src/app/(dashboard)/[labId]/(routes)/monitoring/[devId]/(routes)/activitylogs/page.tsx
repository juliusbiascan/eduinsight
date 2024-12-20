import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { ActivityLogsClient } from "./components/client"

const ActivityLogsPage = async ({
  params
}: {
  params: { devId: string }
}) => {

  const session = await auth()

  if (!session) {
    redirect("/auth/login")
  }


  const activeDeviceUser = await db.activeDeviceUser.findFirst({
    where: {
      deviceId: params.devId,
    }
  })

  if (!activeDeviceUser) {
    return (
      <div className="w-full flex-col">
        <div className="flex-1 p-8 pt-6 space-y-4">
          No Active Device User Found!
        </div>
      </div>
    )
  }

  return (
    <div className="flex-col">
      <div className="flex-1 p-8 pt-6 space-y-4">
        <ActivityLogsClient
          userId={activeDeviceUser.userId}
          deviceId={activeDeviceUser.deviceId}
          labId={activeDeviceUser.labId} />
      </div>
    </div>
  );
}

export default ActivityLogsPage;