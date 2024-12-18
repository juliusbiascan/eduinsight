"use client"

import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';

export type DeviceColumn = {
  id: string
  name: string
  devId: string
  devHostname: string
  devMACaddress: string
  isArchived: boolean
  createdAt: string
}

export const columns: ColumnDef<DeviceColumn>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'isArchived',
    header: 'Archived',
  },
  {
    accessorKey: 'devHostname',
    header: 'Hostname',
  },
  {
    accessorKey: 'devId',
    header: 'Device Id (Client Id)',
  },
  {
    accessorKey: 'devMACaddress',
    header: 'MAC',
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