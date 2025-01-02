import React from "react";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { db } from "@/lib/db";
import Navbar from "../../../components/navbar";
import { SiteFooter } from "@/components/ui/site-footer";

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

  // Fetch the laboratory for the current user
  const lab = await db.labaratory.findFirst({
    where: {
      id: params.labId,
      userId: session.user.id,
    },
  });

  if (!lab) {
    redirect("/");
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      <Navbar user={user} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
