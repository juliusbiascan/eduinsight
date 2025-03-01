'use client';

import {
  KBarAnimator,
  KBarPortal,
  KBarPositioner,
  KBarProvider,
  KBarSearch
} from 'kbar';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { useMemo } from 'react';
import RenderResults from './render-result';
import useThemeSwitching from './use-theme-switching';
import { NavItem } from '@/types';
import { useSession } from 'next-auth/react';

export default function KBar({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
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
      url: `/${params.labId}/laboratory`, // Changed from '#' to actual link
      icon: 'laboratory',
      isActive: pathname === `/${params.labId}/laboratory` ||
        pathname === `/${params.labId}/laboratory` ||
        pathname === `/${params.labId}/devices` ||
        pathname === `/${params.labId}/settings`,
      items: [

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
        },
        {
          title: 'Teams',
          url: `/${params.labId}/teams`,
          icon: 'teams',
          isActive: pathname === `/${params.labId}/teams`,
          shortcut: ['t', 'm'],
          items: []
        },
      ],

    },
    {
      title: 'Network',
      url: `/${params.labId}/network`,
      icon: 'network',
      isActive: pathname === `/${params.labId}/network` ||
        pathname === `/${params.labId}/network/query-log` ||
        pathname === `/${params.labId}/network/domains` ||
        pathname === `/${params.labId}/network/list` ||
        pathname === `/${params.labId}/network/groups` ||
        pathname === `/${params.labId}/network/clients`,
      items: [
        {
          title: 'Groups',
          url: `/${params.labId}/network/groups`,
          icon: 'group',
          isActive: pathname === `/${params.labId}/network/groups`,
          shortcut: ['g', 'r'],
          items: []
        },
        {
          title: 'Clients',
          url: `/${params.labId}/network/clients`,
          icon: 'laptop',
          isActive: pathname === `/${params.labId}/network/clients`,
          shortcut: ['c', 'l'],
          items: []
        },
        {
          title: 'Domains',
          url: `/${params.labId}/network/domains`,
          icon: 'globe',
          isActive: pathname === `/${params.labId}/network/domains`,
          shortcut: ['d', 'm'],
          items: []
        },
        {
          title: 'List',
          url: `/${params.labId}/network/list`,
          icon: 'list',
          isActive: pathname === `/${params.labId}/network/list`,
          shortcut: ['l', 't'],
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

  const navigateTo = (url: string) => {
    router.push(url);
  };

  // These action are for the navigation
  const actions = useMemo(
    () =>
      navItems.flatMap((navItem) => {
        // Only include base action if the navItem has a real URL and is not just a container
        const baseAction =
          navItem.url !== '#'
            ? {
              id: `${navItem.title.toLowerCase()}Action`,
              name: navItem.title,
              shortcut: navItem.shortcut,
              keywords: navItem.title.toLowerCase(),
              section: 'Navigation',
              subtitle: `Go to ${navItem.title}`,
              perform: () => navigateTo(navItem.url)
            }
            : null;

        // Map child items into actions
        const childActions =
          navItem.items?.map((childItem) => ({
            id: `${childItem.title.toLowerCase()}Action`,
            name: childItem.title,
            shortcut: childItem.shortcut,
            keywords: childItem.title.toLowerCase(),
            section: navItem.title,
            subtitle: `Go to ${childItem.title}`,
            perform: () => navigateTo(childItem.url)
          })) ?? [];

        // Return only valid actions (ignoring null base actions for containers)
        return baseAction ? [baseAction, ...childActions] : childActions;
      }),
    []
  );

  return (
    <KBarProvider actions={actions}>
      <KBarComponent>{children}</KBarComponent>
    </KBarProvider>
  );
}
const KBarComponent = ({ children }: { children: React.ReactNode }) => {
  useThemeSwitching();

  return (
    <>
      <KBarPortal>
        <KBarPositioner className='scrollbar-hide fixed inset-0 z-[99999] bg-background/80 dark:bg-background/90 !p-0 backdrop-blur-sm'>
          <KBarAnimator className='relative !mt-64 w-full max-w-[600px] !-translate-y-12 overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-lg'>
            <div className='bg-background/95 dark:bg-background/95'>
              <div className='border-border border-x-0 border-b'>
                <KBarSearch className='w-full border-none bg-transparent px-6 py-4 text-lg outline-none focus:outline-none focus:ring-0 focus:ring-offset-0' />
              </div>
              <RenderResults />
            </div>
          </KBarAnimator>
        </KBarPositioner>
      </KBarPortal>
      {children}
    </>
  );
};
