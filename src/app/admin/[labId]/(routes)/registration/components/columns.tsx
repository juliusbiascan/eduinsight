"use client"

import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import { DeviceUserRole } from '@prisma/client';

export type RegistrationColumn = {
  id: string
  labId: string
  schoolId: string
  firstName: string
  lastName: string
  role: DeviceUserRole
  createdAt: string
}

export const columns: ColumnDef<RegistrationColumn>[] = [
  {
    accessorKey: 'schoolId',
    header: 'School ID',
  },
  {
    accessorKey: 'firstName',
    header: 'Fist Name',
  },
  {
    accessorKey: 'lastName',
    header: 'Last Name',
  },
  {
    accessorKey: 'role',
    header: 'Registered as',
  },
  {
    accessorKey: 'createdAt',
    header: 'Date',
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
]