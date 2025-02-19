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

export function Breadcrumbs({ labs = [] }: { labs: Record<string, any>[] }) {
  const items = useBreadcrumbs();
  const params = useParams();
  const pathname = usePathname();
  
  // Filter out items where the path segment is a labId (24 characters)
  const visibleItems = items.filter(item => !item.link.split('/').some(segment => segment.length === 24));
  
  if (visibleItems.length === 0) return null;

  const showLabSwitcher = pathname !== `/${params.labId}/users`;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {visibleItems.map((item, index) => (
          <Fragment key={item.link}>
            {index === 0 && params.labId && showLabSwitcher ? (
              <BreadcrumbItem>
                <CompactLabSwitcher items={labs} />
              </BreadcrumbItem>
            ) : (
              index !== visibleItems.length - 1 && (
                <BreadcrumbItem className='hidden md:block'>
                  <BreadcrumbLink href={item.link}>{item.title}</BreadcrumbLink>
                </BreadcrumbItem>
              )
            )}
            {index < visibleItems.length - 1 && (
              <BreadcrumbSeparator className='hidden md:block'>
                <Slash />
              </BreadcrumbSeparator>
            )}
            {index === visibleItems.length - 1 && (
              <BreadcrumbPage>{item.title}</BreadcrumbPage>
            )}
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
