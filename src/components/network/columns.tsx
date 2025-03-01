"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Query } from "@/lib/pihole"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

export const columns: ColumnDef<Query, any>[] = [
  {
    accessorKey: "time",
    header: "Time",
    cell: ({ row }) => {
      return format(new Date(row.original.time * 1000), 'yyyy-MM-dd HH:mm:ss')
    }
  },
  {
    accessorKey: "domain",
    header: "Domain",
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      return <Badge variant="secondary">{row.original.type}</Badge>
    }
  },
  {
    accessorKey: "client.ip",
    header: "Client",
    cell: ({ row }) => {
      return (
        <div>
          <div>{row.original.client.ip}</div>
          {row.original.client.name && (
            <div className="text-sm text-muted-foreground">{row.original.client.name}</div>
          )}
        </div>
      )
    }
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status
      return status ? (
        <Badge variant={
          status === 'GRAVITY' ? "destructive" : 
          status === 'FORWARDED' ? "default" :
          "secondary"
        }>
          {status}
        </Badge>
      ) : null
    }
  }
]
