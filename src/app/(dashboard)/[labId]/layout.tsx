import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import Navbar from "./components/navbar";
import { SiteFooter } from "@/components/ui/site-footer";

interface DashboardLayoutProps {
  children: React.ReactNode;
  params: { labId: string };
}

export default async function DashboardLayout({ children, params }: DashboardLayoutProps) {
  // Check if user is authenticated
  const session = await auth();
  if (!session) {
    redirect("/auth/login");
  }

  // Fetch the laboratory for the current user
  const lab = await db.labaratory.findFirst({
    where: {
      id: params.labId,
      userId: session.user.id,
    },
  });

  // Redirect if laboratory not found
  if (!lab) {
    redirect("/");
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
