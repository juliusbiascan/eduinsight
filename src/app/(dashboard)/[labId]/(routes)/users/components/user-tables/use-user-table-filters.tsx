'use client';

import { searchParams } from '@/lib/searchparams';
import { useQueryState } from 'nuqs';
import { useCallback, useMemo } from 'react';

export function useUserTableFilters() {
  const [searchQuery, setSearchQuery] = useQueryState(
    'q',
    searchParams.q.withOptions({ shallow: false, throttleMs: 1000 }).withDefault('')
  );

  const [courseFilter, setCourseFilter] = useQueryState(
    'course',
    searchParams.course.withOptions({ shallow: false }).withDefault('')
  );

  const [roleFilter, setRoleFilter] = useQueryState(
    'role',
    searchParams.role.withOptions({ shallow: false }).withDefault('')
  );

  const [yearLevelFilter, setYearLevelFilter] = useQueryState(
    'yearLevel',
    searchParams.yearLevel.withOptions({ shallow: false }).withDefault('')
  );

  const [page, setPage] = useQueryState(
    'page',
    searchParams.page.withDefault(1)
  );

  const resetFilters = useCallback(() => {
    setSearchQuery(null);
    setCourseFilter(null);
    setRoleFilter(null);
    setYearLevelFilter(null);
    setPage(1);
  }, [setSearchQuery, setCourseFilter, setRoleFilter, setYearLevelFilter, setPage]);

  const isAnyFilterActive = useMemo(() => {
    return !!searchQuery || !!courseFilter || !!roleFilter || !!yearLevelFilter;
  }, [searchQuery, courseFilter, roleFilter, yearLevelFilter]);

  return {
    searchQuery,
    setSearchQuery,
    courseFilter,
    setCourseFilter,
    roleFilter,
    setRoleFilter,
    yearLevelFilter,
    setYearLevelFilter,
    page,
    setPage,
    resetFilters,
    isAnyFilterActive
  };
}
