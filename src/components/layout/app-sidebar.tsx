'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger
} from '@/components/ui/collapsible';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarRail,
    useSidebar
} from '@/components/ui/sidebar';

import {
    BadgeCheck,
    Bell,
    ChevronRight,
    ChevronsUpDown,
    CreditCard,
    GalleryVerticalEnd,
    LogOut,
    SparklesIcon
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import * as React from 'react';
import { Icons } from '../icons';

import Image from "next/image";
import { NavItem } from "@/types";


export const company = {
    name: 'Pass College',
    logo: GalleryVerticalEnd,
    plan: 'Eduinsight'
};

export default function AppSidebar() {
    const { data: session } = useSession();
    const pathname = usePathname();
    const { state, isMobile } = useSidebar();
    const params = useParams();

    
    //Info: The following data is used for the sidebar navigation and Cmd K bar.
    const navItems: NavItem[] = [
        {
            title: 'Dashboard',
            url: `/${params.labId}/overview`,
            icon: 'dashboard',
            isActive: pathname === `/${params.labId}/overview`,
            shortcut: ['o', 'v'],
            items: []
        },
        {
            title: 'Analytics',
            url: `/${params.labId}/analytics`,
            icon: 'analytics',
            isActive: pathname === `/${params.labId}/analytics`,
            shortcut: ['d', 'u'],
            items: []
        },
        {
            title: 'Laboratory',
            url: '#', // Placeholder as there is no direct link for the parent
            icon: 'laboratory',
            isActive: true,
            items: [
                {
                    title: 'Monitoring',
                    url: `/${params.labId}/monitoring`,
                    icon: 'monitoring',
                    isActive: pathname === `/${params.labId}/monitoring`,
                    shortcut: ['m', 'n'],
                    items: []
                },
                {
                    title: 'Devices',
                    url: `/${params.labId}/devices`,
                    icon: 'devices',
                    isActive: pathname === `/${params.labId}/devices`,
                    shortcut: ['d', 'v'],
                    items: []
                },
                {
                    title: 'Settings',
                    url: `/${params.labId}/settings`,
                    icon: 'settings',
                    isActive: pathname === `/${params.labId}/settings`,
                    shortcut: ['s', 't'],
                    items: []
                }
            ],

        },

        {
            title: 'Users',
            url: `/${params.labId}/users`,
            icon: 'users',
            isActive: pathname === `/${params.labId}/users`,
            shortcut: ['d', 'u'],
            items: []
        },
        {
            title: 'Account',
            url: `/${params.labId}/account`,
            icon: 'billing',
            isActive: pathname === `/${params.labId}/account`,
            shortcut: ['s', 't'],
            items: []
        }
    ];

    return (
        <Sidebar collapsible='icon'>
            <SidebarHeader>
                <div className='flex gap-2 py-2 text-sidebar-accent-foreground'>
                    <div className='flex aspect-square size-8 items-center justify-center rounded-lg'>
                        {/* <company.logo className='size-4' /> */}
                        <div className="relative">
                            <Image
                                src="/passlogo-small.png"
                                alt="SMNHS Logo"
                                width={48}
                                height={48}
                                className="rounded-full border-2 border-[#C9121F] shadow-md transition-all duration-300"
                            />
                            <SparklesIcon className="absolute -top-1 -right-1 h-4 w-4 text-[#EBC42E] animate-pulse" />
                        </div>
                    </div>
                    <div className='grid flex-1 text-left text-sm leading-tight'>
                        <span className='truncate font-semibold'>{company.name}</span>
                        <span className='truncate text-xs'>{company.plan}</span>
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent className='overflow-x-hidden'>
                <SidebarGroup>
                    <SidebarGroupLabel>Overview</SidebarGroupLabel>
                    <SidebarMenu>
                        {navItems.map((item) => {
                            const Icon = item.icon ? Icons[item.icon] : Icons.logo;
                            return item?.items && item?.items?.length > 0 ? (
                                <Collapsible
                                    key={item.title}
                                    asChild
                                    defaultOpen={item.isActive}
                                    className='group/collapsible'
                                >
                                    <SidebarMenuItem>
                                        <CollapsibleTrigger asChild>
                                            <SidebarMenuButton
                                                tooltip={item.title}
                                                isActive={pathname === item.url}
                                            >
                                                {item.icon && <Icon />}
                                                <span>{item.title}</span>
                                                <ChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                                            </SidebarMenuButton>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <SidebarMenuSub>
                                                {item.items?.map((subItem) => (
                                                    <SidebarMenuSubItem key={subItem.title}>
                                                        <SidebarMenuSubButton
                                                            asChild
                                                            isActive={pathname === subItem.url}
                                                        >
                                                            <Link href={subItem.url}>
                                                                <span>{subItem.title}</span>
                                                            </Link>
                                                        </SidebarMenuSubButton>
                                                    </SidebarMenuSubItem>
                                                ))}
                                            </SidebarMenuSub>
                                        </CollapsibleContent>
                                    </SidebarMenuItem>
                                </Collapsible>
                            ) : (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        tooltip={item.title}
                                        isActive={pathname === item.url}
                                    >
                                        <Link href={item.url}>
                                            <Icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            );
                        })}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size='lg'
                                    className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
                                >
                                    <Avatar className='h-8 w-8 rounded-lg'>
                                        <AvatarImage
                                            src={session?.user?.image || ''}
                                            alt={session?.user?.name || ''}
                                        />
                                        <AvatarFallback className='rounded-lg'>
                                            {session?.user?.name?.slice(0, 2)?.toUpperCase() || 'CN'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className='grid flex-1 text-left text-sm leading-tight'>
                                        <span className='truncate font-semibold'>
                                            {session?.user?.name || ''}
                                        </span>
                                        <span className='truncate text-xs'>
                                            {session?.user?.email || ''}
                                        </span>
                                    </div>
                                    <ChevronsUpDown className='ml-auto size-4' />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className='w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg'
                                side='bottom'
                                align='end'
                                sideOffset={4}
                            >
                                <DropdownMenuLabel className='p-0 font-normal'>
                                    <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
                                        <Avatar className='h-8 w-8 rounded-lg'>
                                            <AvatarImage
                                                src={session?.user?.image || ''}
                                                alt={session?.user?.name || ''}
                                            />
                                            <AvatarFallback className='rounded-lg'>
                                                {session?.user?.name?.slice(0, 2)?.toUpperCase() ||
                                                    'CN'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className='grid flex-1 text-left text-sm leading-tight'>
                                            <span className='truncate font-semibold'>
                                                {session?.user?.name || ''}
                                            </span>
                                            <span className='truncate text-xs'>
                                                {' '}
                                                {session?.user?.email || ''}
                                            </span>
                                        </div>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />

                                <DropdownMenuGroup>
                                    <DropdownMenuItem>
                                        <BadgeCheck />
                                        Account
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <CreditCard />
                                        Billing
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Bell />
                                        Notifications
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => signOut()}>
                                    <LogOut />
                                    Log out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
