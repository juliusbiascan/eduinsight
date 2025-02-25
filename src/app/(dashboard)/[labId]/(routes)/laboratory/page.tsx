import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { MonitoringClient } from "./components/client";
import { getDeviceStats } from "@/data/device-stats";
import PageContainer from "@/components/layout/page-container";
import { State } from "@prisma/client";
import { Suspense } from "react";

const Monitoring = async ({
  params
}: {
  params: { labId: string }
}) => {
  let lab;

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
    lab = await db.labaratory.findFirst({
      where: {
        id: team.labId,
      },
    });

    if (!lab) {
      redirect('/');
    }
  } else {
    lab = await db.labaratory.findFirst({ where: { id: params.labId, userId: session.user.id } });

    if (!lab) {
      redirect('/');
    }
  }

  const activeDevices = await db.activeDeviceUser.findMany({
    where: {
      labId: lab.id,
      state: State.ACTIVE
    },
    include: {
      device: true,
      user: true
    }
  });

  const inactiveDevices = await db.device.findMany({ where: { labId: lab.id, isUsed: false } })

  return (
    <PageContainer>
      <Suspense fallback={<div>Loading...</div>}>
        <div className="flex-1 space-y-4">
          <MonitoringClient
            allActiveDevice={activeDevices}
            allInactiveDevice={inactiveDevices}
          />
        </div>
      </Suspense>
    </PageContainer>
  );
}

export default Monitoring;