"use client"

import { Query } from "@/lib/pihole"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { ChevronsUpDown } from "lucide-react"
import { format } from "date-fns"

interface QueryDetailsProps {
  query: Query
}

export function QueryDetails({ query }: QueryDetailsProps) {
  return (
    <div className="grid gap-2 text-sm">
      <div className="grid grid-cols-2">
        <span className="font-medium">Time:</span>
        <span>{format(new Date(query.time * 1000), 'PPpp')}</span>
      </div>
      <div className="grid grid-cols-2">
        <span className="font-medium">Domain:</span>
        <span>{query.domain}</span>
      </div>
      {query.cname && (
        <div className="grid grid-cols-2">
          <span className="font-medium">CNAME:</span>
          <span>{query.cname}</span>
        </div>
      )}
      <div className="grid grid-cols-2">
        <span className="font-medium">Client:</span>
        <span>{query.client.ip} {query.client.name && `(${query.client.name})`}</span>
      </div>
      <div className="grid grid-cols-2">
        <span className="font-medium">Type:</span>
        <span>{query.type}</span>
      </div>
      {query.status && (
        <div className="grid grid-cols-2">
          <span className="font-medium">Status:</span>
          <span>{query.status}</span>
        </div>
      )}
      {query.dnssec && (
        <div className="grid grid-cols-2">
          <span className="font-medium">DNSSEC:</span>
          <span>{query.dnssec}</span>
        </div>
      )}
      {query.reply.type && (
        <div className="grid grid-cols-2">
          <span className="font-medium">Reply:</span>
          <span>{query.reply.type} ({query.reply.time}ms)</span>
        </div>
      )}
      {query.upstream && (
        <div className="grid grid-cols-2">
          <span className="font-medium">Upstream:</span>
          <span>{query.upstream}</span>
        </div>
      )}
    </div>
  )
}
