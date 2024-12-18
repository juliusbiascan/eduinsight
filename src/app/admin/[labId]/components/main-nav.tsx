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
            href: `/admin/${params.labId}`,
            label: 'Overview',
            active: pathname === `/admin/${params.labId}`,
        },
        {
            href: `/admin/${params.labId}/devices`,
            label: 'Devices',
            active: pathname === `/admin/${params.labId}/devices`,
        },
        {
            href: `/admin/${params.labId}/monitoring`,
            label: 'Monitoring',
            active: pathname === `/admin/${params.labId}/monitoring`,
        },
        {
            href: `/admin/${params.labId}/registration`,
            label: 'Users',
            active: pathname === `/admin/${params.labId}/registration`,
        },
        {
            href: `/admin/${params.labId}/settings`,
            label: 'Settings',
            active: pathname === `/admin/${params.labId}/settings`,
        },
    ]

    return (
        <div className="mr-4 hidden md:flex">
            <nav
                className={cn("flex items-center space-x-2 rounded-lg bg-[#EAEAEB] dark:bg-[#1A1617] p-1", className)}
                {...props}
            >
                {routes.map((route) => (
                    <Link
                        key={route.href}
                        href={route.href}
                        className={cn(
                            'px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ease-in-out',
                            route.active
                                ? 'bg-[#C9121F] text-white shadow-sm dark:bg-[#EBC42E] dark:text-[#1A1617]'
                                : 'text-[#1A1617] hover:bg-[#C9121F] hover:text-white dark:text-[#EAEAEB] dark:hover:bg-[#EBC42E] dark:hover:text-[#1A1617]'
                        )}
                    >
                        {route.label}
                    </Link>
                ))}
            </nav>
        </div>
    )
};
