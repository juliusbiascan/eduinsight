'use client';

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { SparklesIcon } from "@heroicons/react/24/solid";
import {
  LayoutDashboard,
  BookOpen,
  Settings,
  Users,
  Calendar,
  BarChart,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useState } from "react";

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard
  },
  {
    title: "Courses",
    href: "/courses",
    icon: BookOpen
  },
  {
    title: "Students",
    href: "/students",
    icon: Users
  },
  {
    title: "Schedule",
    href: "/schedule",
    icon: Calendar
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings
  }
];

export function Sidebar({ labId }: { labId: string }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside className={cn(
      "fixed top-0 left-0 z-40 h-screen",
      "w-64 transition-all duration-300",
      "border-r border-gray-200 dark:border-gray-700",
      "bg-white dark:bg-gray-900",
      isCollapsed ? "w-20" : "w-64"
    )}>
      {/* Logo Section */}
      <div className="flex flex-col items-center py-6">
        <div className="relative">
          <Image
            src="/passlogo-small.png"
            alt="SMNHS Logo"
            width={isCollapsed ? 40 : 48}
            height={isCollapsed ? 40 : 48}
            className="rounded-full border-2 border-[#C9121F] shadow-md transition-all duration-300"
          />
          <SparklesIcon className="absolute -top-1 -right-1 h-4 w-4 text-[#EBC42E] animate-pulse" />
        </div>
        {!isCollapsed && (
          <h1 className="mt-3 font-semibold text-gray-900 dark:text-gray-100">
            EduInsight
          </h1>
        )}
      </div>

      {/* Navigation Items */}
      <div className="flex-1 px-3 py-4 overflow-y-auto">
        <nav className="flex flex-col gap-1">
          {sidebarItems.map((item) => (
            <Link
              key={item.href}
              href={`/${labId}${item.href}`}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                "hover:bg-gray-100 dark:hover:bg-gray-800",
                pathname.includes(item.href)
                  ? "bg-gray-100 text-primary dark:bg-gray-800 dark:text-gray-200"
                  : "text-gray-600 dark:text-gray-400"
              )}
            >
              <item.icon className={cn(
                "h-5 w-5 flex-shrink-0",
                pathname.includes(item.href) && "text-primary"
              )} />
              {!isCollapsed && <span>{item.title}</span>}
            </Link>
          ))}
        </nav>
      </div>

      {/* Collapse Button */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "flex w-full items-center justify-center rounded-lg p-2",
            "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800",
            "transition-colors duration-200"
          )}
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>
    </aside>
  );
}
