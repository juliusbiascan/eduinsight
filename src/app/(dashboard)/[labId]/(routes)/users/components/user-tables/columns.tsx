'use client';

import { Badge } from '@/components/ui/badge';
import { DeviceUser } from '@prisma/client';
import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';

export const columns: ColumnDef<DeviceUser>[] = [
  {
    accessorKey: 'schoolId',
    header: 'SCHOOL ID'
  },
  {
    accessorKey: 'name',
    header: 'NAME',
    cell: ({ row }) => (
      <div>
        {row.original.firstName} {row.original.lastName}
      </div>
    )
  },
  {
    accessorKey: 'email',
    header: 'EMAIL',
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate">
        {row.original.email || 'Not set'}
      </div>
    )
  },
  {
    accessorKey: 'course',
    header: 'COURSE'
  },
  {
    accessorKey: 'yearLevel',
    header: 'YEAR',
    cell: ({ row }) => {
      const yearMap: { [key: string]: string } = {
        'FIRST': '1st',
        'SECOND': '2nd',
        'THIRD': '3rd',
        'FOURTH': '4th'
      };
      return row.original.role === 'STUDENT' ? yearMap[row.original.yearLevel] : '-';
    }
  },
  {
    accessorKey: 'role',
    header: 'ROLE',
    cell: ({ row }) => (
      <Badge variant="outline">
        {row.original.role}
      </Badge>
    )
  },
  {
    accessorKey: 'status',
    header: 'STATUS',
    cell: ({ row }) => {
      const isActivated = row.original.email && row.original.contactNo;
      const status = isActivated ? 'Activated' : 'Not Activated';
      return (
        <Badge
          variant={isActivated ? "success" : "destructive"}
          className={`${isActivated 
            ? "bg-green-500/10 text-green-500 hover:bg-green-500/20" 
            : "bg-red-500/10 text-red-500 hover:bg-red-500/20"
          }`}
        >
          {status}
        </Badge>
      );
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
