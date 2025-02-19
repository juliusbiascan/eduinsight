import React from "react";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { db } from "@/lib/db";
import { SiteFooter } from "@/components/ui/site-footer";
import { Sidebar } from "@/components/sidebar";
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { cookies } from "next/headers";

import AppSidebar from "@/components/layout/app-sidebar";
import Header from "@/components/layout/header";

interface DashboardLayoutProps {
    children: React.ReactNode;
    params: { labId: string };
}

export default async function DashboardLayout({ children, params }: DashboardLayoutProps) {
    const session = await auth();
    // Persisting the sidebar state in the cookie.
    const cookieStore = await cookies();
    const defaultOpen = cookieStore.get('sidebar:state')?.value === 'true';
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

    return (
        <SidebarProvider defaultOpen={defaultOpen}>
            <AppSidebar />
            <SidebarInset>
                <Header />
                {/* page main content */}
                {children}
                {/* page main content ends */}
            </SidebarInset>
        </SidebarProvider>
    );
}
