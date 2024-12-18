import { auth } from '@/auth';
import { getUserById } from '@/data/user';
import { db } from '@/lib/db'
import { redirect } from 'next/navigation';
import { PowerLogClient } from './components/client';
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Rainbow } from "lucide-react";

const PowerLogsPage = async ({
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

  const pml = await db.powerMonitoringLogs.findMany({
    where: {
      labId: lab.id,
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return (
    <div className="p-4 space-y-4 bg-gradient-to-br from-pink-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
        <div className="flex items-center">
          <Rainbow className="h-6 w-6 text-pink-500 dark:text-pink-400 mr-2" />
          <Heading
            title="Power Monitoring Logs"
            description="View Power Logs of this lab"
            className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-blue-500 dark:from-pink-400 dark:to-blue-400"
          />
        </div>
      </div>
      <Separator />
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
        <PowerLogClient data={pml} />
      </div>
    </div>
  )
}

export default PowerLogsPage;