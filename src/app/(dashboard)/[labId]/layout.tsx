import React from "react";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { db } from "@/lib/db";
import Navbar from "../../../components/navbar";
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

  if (!user) {
    await signOut({ redirectTo: "/" });
  }

  // Fetch the laboratories for the current user
  const labs = await db.labaratory.findMany({
    where: { userId: session.user.id }
  });

  if (!labs) {
    redirect("/");
  }

  return (
    <>
      {children}
      <SiteFooter />
    </>
  );
}
