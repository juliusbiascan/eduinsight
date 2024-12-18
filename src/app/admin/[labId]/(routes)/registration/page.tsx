import { format } from 'date-fns'
import { db } from '@/lib/db'
import { RegistrationClient } from './components/client'
import { RegistrationColumn } from './components/columns'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

const RegistrationPage = async ({
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
    orderBy: {
      createdAt: 'desc'
    }
  })

  const formattedDevices: RegistrationColumn[] = devUser.map(item => ({
    id: item.id,
    labId: item.labId,
    schoolId: item.schoolId,
    firstName: item.firstName,
    lastName: item.lastName,
    role: item.role,
    createdAt: format(item.createdAt, "MMMM do, yyyy"),
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 p-8 pt-6 space-y-4">
        <RegistrationClient data={formattedDevices} />
      </div>
    </div>
  )
}

export default RegistrationPage;
