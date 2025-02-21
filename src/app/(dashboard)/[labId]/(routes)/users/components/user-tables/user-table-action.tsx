'use client';

import { DataTableFilterBox } from '@/components/ui/table/data-table-filter-box';
import { DataTableResetFilter } from '@/components/ui/table/data-table-reset-filter';
import { DataTableSearch } from '@/components/ui/table/data-table-search';
import { useUserTableFilters } from './use-user-table-filters';

export default function UserTableAction() {
  const {
    courseFilter,
    setCourseFilter,
    roleFilter,
    setRoleFilter,
    yearLevelFilter,
    setYearLevelFilter,
    isAnyFilterActive,
    resetFilters,
    searchQuery,
    setPage,
    setSearchQuery
  } = useUserTableFilters();

  return (
    <div className='flex flex-wrap items-center gap-4'>
      <DataTableSearch
        searchKey='name'
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setPage={setPage}
      />
      <DataTableFilterBox
        filterKey='course'
        title='Course'
        options={[
          { value: 'BSA', label: 'BSA' },
          { value: 'BSCRIM', label: 'BSCRIM' },
          { value: 'BEED', label: 'BEED' },
          { value: 'BSBA', label: 'BSBA' },
          { value: 'BSCS', label: 'BSCS' },
          { value: 'BSHM', label: 'BSHM' },
          { value: 'BSTM', label: 'BSTM' }
        ]}
        setFilterValue={setCourseFilter}
        filterValue={courseFilter}
      />
      <DataTableFilterBox
        filterKey='role'
        title='Role'
        options={[
          { value: 'STUDENT', label: 'Student' },
          { value: 'TEACHER', label: 'Teacher' }
        ]}
        setFilterValue={setRoleFilter}
        filterValue={roleFilter}
      />
      <DataTableFilterBox
        filterKey='yearLevel'
        title='Year Level'
        options={[
          { value: 'FIRST', label: '1st Year' },
          { value: 'SECOND', label: '2nd Year' },
          { value: 'THIRD', label: '3rd Year' },
          { value: 'FOURTH', label: '4th Year' }
        ]}
        setFilterValue={setYearLevelFilter}
        filterValue={yearLevelFilter}
      />
      <DataTableResetFilter
        isFilterActive={isAnyFilterActive}
        onReset={resetFilters}
      />
    </div>
  );
}
