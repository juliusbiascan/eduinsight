import { db } from '@/lib/db'

import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { State } from '@prisma/client'
import { UserClient } from './components/client'

const UsersPage = async ({
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

  const devUser = await db.deviceUser.findMany({
    where: {
      labId: lab.id,
    },
    include: {
      activeDevices: {
        where: {
          labId: lab.id,
          state: State.ACTIVE
        },
        orderBy: {
          createdAt: 'desc'
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
        <UserClient data={devUser} />
      </div>
    </div>
  )
}

export default UsersPage;
