import { db } from '@/lib/db'
import { DeviceClient } from './components/client'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import PageContainer from '@/components/layout/page-container'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Separator } from '@radix-ui/react-dropdown-menu'
import { Link, Plus } from 'lucide-react'
import { Heading } from '@/components/ui/heading'

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