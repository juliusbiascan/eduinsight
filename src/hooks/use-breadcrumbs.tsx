'use client';

import { usePathname, useParams } from 'next/navigation';
import { useMemo } from 'react';

export function useBreadcrumbs() {
  const pathname = usePathname();
  const params = useParams();

  const breadcrumbs = useMemo(() => {
    const segments = pathname.split('/').filter(Boolean);
    
    // Filter out labId and userId segments
    const filteredSegments = segments.filter(segment => 
      segment !== params.labId && 
      segment !== params.userId
    );
    
    return filteredSegments.map((segment, index) => {
      const path = `/${segments.slice(0, segments.indexOf(segment) + 1).join('/')}`;
      
      const title = segment.charAt(0).toUpperCase() + segment.slice(1);
        
      return {
        title,
        link: path
      };
    });
  }, [pathname, params.labId, params.userId]);

  return breadcrumbs;
}
