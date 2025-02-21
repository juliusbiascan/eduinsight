import { db } from '@/lib/db'

import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { State } from '@prisma/client'
import { UserClient } from './components/client'
import PageContainer from '@/components/layout/page-container'

const UsersPage = async ({
  params
}: {
  params: { labId: string }
}) => {
  const session = await auth()

  if (!session) {
    redirect("/auth/login")
  }


  const devUser = await db.deviceUser.findMany({

    include: {
      activeDevices: {
        where: {
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
    <PageContainer scrollable={false}>
      <div className="flex-col">
        <div className="flex-1 p-8 pt-6 space-y-4">
          <UserClient data={devUser} />
        </div>
      </div>
    </PageContainer>
  )
}

export default UsersPage;
