'use client';

import { usePathname, useParams } from 'next/navigation';
import { useMemo } from 'react';

type BreadcrumbItem = {
  title: string;
  link: string;
};

// This allows to add custom title as well
const routeMapping: Record<string, BreadcrumbItem[]> = {
  '/dashboard': [{ title: 'Dashboard', link: '/dashboard' }],
  '/dashboard/employee': [
    { title: 'Dashboard', link: '/dashboard' },
    { title: 'Employee', link: '/dashboard/employee' }
  ],
  '/dashboard/product': [
    { title: 'Dashboard', link: '/dashboard' },
    { title: 'Product', link: '/dashboard/product' }
  ]
  // Add more custom mappings as needed
};

export function useBreadcrumbs() {
  const pathname = usePathname();
  const params = useParams();

  const breadcrumbs = useMemo(() => {
    // Check if we have a custom mapping for this exact path
    if (routeMapping[pathname]) {
      return routeMapping[pathname];
    }

    // If no exact match, generate breadcrumbs from the path
    const segments = pathname.split('/').filter(Boolean);
    
    // If first segment is a labId, start from second segment
    const startIndex = segments[0]?.length === 24 ? 1 : 0;
    
    return segments.slice(startIndex).map((segment, index) => {
      const pathSegments = startIndex === 1 
        ? [segments[0], ...segments.slice(1, index + 2)]
        : segments.slice(0, index + 1);
      
      const path = `/${pathSegments.join('/')}`;
      
      let title;
      if (segment === params.labId) {
        title = 'Dashboard';
      } else {
        title = segment.charAt(0).toUpperCase() + segment.slice(1);
      }
        
      return {
        title,
        link: path
      };
    });
  }, [pathname, params.labId]);

  return breadcrumbs;
}
