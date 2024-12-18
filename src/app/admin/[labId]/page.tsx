import React from 'react';
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { DashboardClient } from "./components/dashboard-client";

interface DashboardPageProps { params: { labId: string; }; }

const DashboardPage: React.FC<DashboardPageProps> = async ({ params }) => {
  const session = await auth();

  if (!session) redirect("/auth/login");

  const lab = await db.labaratory.findFirst({ where: { id: params.labId, userId: session.user.id } });

  if (!lab) redirect('/');

  return (
    <div className="p-4 space-y-4">
      <DashboardClient params={params} />
    </div>
  );
}

export default DashboardPage;