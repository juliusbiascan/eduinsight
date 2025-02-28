"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ChevronsUpDown } from "lucide-react"
import { useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface QueryFiltersProps {
  onFiltersChange: (filters: Record<string, string>) => void;
}

export function QueryFilters({ onFiltersChange }: QueryFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState<Record<string, string>>({})

  const updateFilters = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value }
    if (!value) delete newFilters[key]
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="w-full space-y-2"
    >
      <div className="flex items-center justify-between space-x-4 px-4">
        <h4 className="text-sm font-semibold">
          Advanced Filters
        </h4>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm">
            <ChevronsUpDown className="h-4 w-4" />
            <span className="sr-only">Toggle</span>
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="space-y-4 px-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="grid gap-2">
            <Label htmlFor="domain">Domain</Label>
            <Input
              id="domain"
              placeholder="example.com"
              onChange={(e) => updateFilters('domain', e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="client">Client IP</Label>
            <Input
              id="client"
              placeholder="192.168.1.100"
              onChange={(e) => updateFilters('client_ip', e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="type">Query Type</Label>
            <Select onValueChange={(value) => updateFilters('type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A">A</SelectItem>
                <SelectItem value="AAAA">AAAA</SelectItem>
                <SelectItem value="ANY">ANY</SelectItem>
                <SelectItem value="SRV">SRV</SelectItem>
                <SelectItem value="SOA">SOA</SelectItem>
                <SelectItem value="PTR">PTR</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select onValueChange={(value) => updateFilters('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GRAVITY">GRAVITY</SelectItem>
                <SelectItem value="FORWARDED">FORWARDED</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
