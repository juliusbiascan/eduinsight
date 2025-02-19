import React from "react";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { db } from "@/lib/db";
import { SiteFooter } from "@/components/ui/site-footer";
import { Sidebar } from "@/components/sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  params: { labId: string };
}

export default async function DashboardLayout({ children, params }: DashboardLayoutProps) {
  const session = await auth();
  if (!session) {
    redirect("/auth/login");
  }

  const user = await db.user.findUnique({
    where: {
      id: session.user.id
    }
  });

  if(!user) {
    await signOut({ redirectTo: "/" });
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      <div className="flex-1 flex">
        <Sidebar labId={params.labId} />
        <main className="flex-1 p-6">{children}</main>
      </div>
      <SiteFooter />
    </div>
  );
}
