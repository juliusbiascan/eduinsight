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
import { LabSwitcher } from './lab-switcher';
import { Slash } from 'lucide-react';
import { Fragment } from 'react';
import { useParams, usePathname } from 'next/navigation';
import { UserSwitcher } from './user-switcher';
import { DeviceSwitcher } from './device-switcher';

export function Breadcrumbs({ labs = [] }: { labs: Record<string, any>[] }) {
  const items = useBreadcrumbs();
  const params = useParams();
  const pathname = usePathname();

  // Filter out items where the path segment is a labId (24 characters)
  const visibleItems = items.filter(item => !item.link.split('/').some(segment => segment.length === 24));
  const showLabSwitcher = !pathname.includes('/network') || !pathname.includes('/users') && labs.length !== 0;
  const showUserSwitcher = params.userId && (pathname.includes('/logs') || pathname.includes('/users'));
  const showDeviceSwitcher = params.devId;

  if (visibleItems.length === 0) return null;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href={`/${params.labId}`}>Dashboard</BreadcrumbLink>
        </BreadcrumbItem>

        {showLabSwitcher && (
          <>
            <BreadcrumbSeparator className='hidden md:block'>
              <Slash />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <LabSwitcher items={labs} />
            </BreadcrumbItem>
          </>

        )}

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
              ) : showDeviceSwitcher ? (
                <BreadcrumbItem>
                  <DeviceSwitcher />
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
