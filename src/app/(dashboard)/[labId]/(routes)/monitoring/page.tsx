import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { MonitoringClient } from "./components/client";
import { getDeviceStats } from "@/data/device-stats";

const Monitoring = async ({
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

  const stats = await getDeviceStats(params.labId);

  return (
    <div className="flex-col">
      <div className="flex-1 p-8 pt-6 space-y-4">
        <MonitoringClient 
          labId={lab.id}
          initialStats={stats}
        />
      </div>
    </div>
  );
}

export default Monitoring;