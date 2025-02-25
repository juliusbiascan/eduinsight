import { db } from '@/lib/db'
import { DeviceClient } from './components/client'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import PageContainer from '@/components/layout/page-container'

const DevicePage = async ({
  params
}: {
  params: { labId: string }
}) => {

  const session = await auth()

  if (!session) {
    redirect("/auth/login")
  }

  const team = await db.team.findFirst({
    where: {
      labId: params.labId,
      users: {
        some: {
          id: session.user.id,
        },
      }
    }
  });

  if (team) {
    const lab = await db.labaratory.findFirst({
      where: {
        id: team.labId,
      },
    });

    if (!lab) {
      redirect('/');
    }
  } else {
    const lab = await db.labaratory.findFirst({ where: { id: params.labId, userId: session.user.id } });

    if (!lab) {
      redirect('/');
    }
  }

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
        },
        orderBy: {
          createdAt: 'desc'
        },
      },
      powerMonitoringLogs: {
        orderBy: {
          createdAt: 'desc'
        },
        take: 1
      }
    }
  });

  // Sort devices naturally (e.g., PC 1, PC 2, PC 10)
  const sortedDevices = devices.sort((a, b) => {
    const aMatch = a.name.match(/^(.*?)(\d+)/) || [a.name, a.name, ""];
    const bMatch = b.name.match(/^(.*?)(\d+)/) || [b.name, b.name, ""];

    const [, aText, aNum] = aMatch;
    const [, bText, bNum] = bMatch;

    if (aText === bText) {
      return parseInt(aNum || "0") - parseInt(bNum || "0");
    }
    return aText.localeCompare(bText);
  });

  return (

    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col space-y-4'>

        <DeviceClient devices={sortedDevices} />
      </div>
    </PageContainer>
  )
}

export default DevicePage;