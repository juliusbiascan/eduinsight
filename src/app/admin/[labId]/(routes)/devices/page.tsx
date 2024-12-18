import { format } from 'date-fns'
import { db } from '@/lib/db'
import { DeviceClient } from './components/client'
import { DeviceColumn } from './components/columns'
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
    orderBy: {
      createdAt: 'desc'
    }
  })

  const formattedDevices: DeviceColumn[] = devices.map(item => ({
    id: item.id,
    name: item.name,
    devHostname: item.devHostname,
    devId: item.devId,
    devMACaddress: item.devMACaddress,
    isArchived: item.isArchived,
    createdAt: format(item.createdAt, "MMMM do, yyyy"),
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 p-8 pt-6 space-y-4">
        <DeviceClient data={formattedDevices} />
      </div>
    </div>
  )
}

export default DevicePage;