import { db } from '@/lib/db'
import { DeviceClient } from './components/client'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

const DevicePage = async ({
  params
}: {
  params: { labId: string }
}) => {

  const session = await auth()

  if (!session) {
    redirect("/auth/login")
  }

  const lab = await db.labaratory.findFirst({
    where: {
      id: params.labId,
      userId: session.user.id,
    }
  });


  if (!lab) {
    redirect('/');
  };

  const devices = await db.device.findMany({
    where: {
      labId: params.labId,
    },
    include: {
      activeUsers: {
        include: {
          user: true
        }
      },
      activeUserLogs: {
        include: {
          user: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })


  return (
    <div className="flex-col">
      <div className="flex-1 p-8 pt-6 space-y-4">
        <DeviceClient devices={devices} />
      </div>
    </div>
  )
}

export default DevicePage;