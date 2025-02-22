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
