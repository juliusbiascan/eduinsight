"use client";

import Link from "next/link"
import { useParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils"

export function MainNav({
    className,
    ...props
}: React.HTMLAttributes<HTMLElement>) {
    const pathname = usePathname();
    const params = useParams();

    const routes = [
        {
            href: `/${params.labId}`,
            label: 'Overview',
            active: pathname === `/${params.labId}`,
        },
        {
            href: `/${params.labId}/monitoring`,
            label: 'Monitoring',
            active: pathname === `/${params.labId}/monitoring`,
        },
        {
            href: `/${params.labId}/devices`,
            label: 'Devices',
            active: pathname === `/${params.labId}/devices`,
        },
        {
            href: `/${params.labId}/users`,
            label: 'Users',
            active: pathname === `/${params.labId}/users`,
        },
        {
            href: `/${params.labId}/settings`,
            label: 'Settings',
            active: pathname === `/${params.labId}/settings`,
        },
    ]

    return (
        <nav
            className={cn("hidden lg:flex items-center space-x-2 rounded-lg bg-[#EAEAEB] dark:bg-[#1A1617] p-1", className)}
            {...props}
        >
            {routes.map((route) => (
                <Link
                    key={route.href}
                    href={route.href}
                    className={cn(
                        'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                        route.active
                            ? 'bg-[#C9121F] text-white shadow-sm dark:bg-[#EBC42E] dark:text-[#1A1617]'
                            : 'text-[#1A1617] hover:bg-[#C9121F] hover:text-white dark:text-[#EAEAEB] dark:hover:bg-[#EBC42E] dark:hover:text-[#1A1617]'
                    )}
                >
                    {route.label}
                </Link>
            ))}
        </nav>
    )
};
