'use client';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { useBreadcrumbs } from '@/hooks/use-breadcrumbs';
import { CompactLabSwitcher } from './compact-lab-switcher';
import { Slash } from 'lucide-react';
import { Fragment } from 'react';
import { useParams, usePathname } from 'next/navigation';
import { UserSwitcher } from './user-switcher';

export function Breadcrumbs({ labs = [] }: { labs: Record<string, any>[] }) {
  const items = useBreadcrumbs();
  const params = useParams();
  const pathname = usePathname();

  // Filter out items where the path segment is a labId (24 characters)
  const visibleItems = items.filter(item => !item.link.split('/').some(segment => segment.length === 24));
  const showLabSwitcher = pathname !== `/${params.labId}/users`;
  const showUserSwitcher = params.userId && (pathname.includes('/logs') || pathname.includes('/users'));

  if (visibleItems.length === 0) return null;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href={`/${params.labId}`}>Dashboard</BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbSeparator className='hidden md:block'>
          <Slash />
        </BreadcrumbSeparator>

        <BreadcrumbItem>
          <CompactLabSwitcher items={labs} />
        </BreadcrumbItem>

        {visibleItems.map((item, index) => (
          <Fragment key={item.link}>
            <BreadcrumbSeparator className='hidden md:block'>
              <Slash />
            </BreadcrumbSeparator>

            {index === visibleItems.length - 1 ? (
              showUserSwitcher ? (
                <BreadcrumbItem>
                  <UserSwitcher />
                </BreadcrumbItem>
              ) : (
                <BreadcrumbPage>{item.title}</BreadcrumbPage>
              )
            ) : (
              <BreadcrumbItem className='hidden md:block'>
                <BreadcrumbLink href={item.link}>{item.title}</BreadcrumbLink>
              </BreadcrumbItem>
            )}
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
