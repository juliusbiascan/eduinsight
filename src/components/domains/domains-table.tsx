import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { TopDomain } from "@/lib/pihole"

interface DomainsTableProps {
  domains: TopDomain[]
  totalQueries: number
}

export function DomainsTable({ domains, totalQueries }: DomainsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Domain</TableHead>
          <TableHead className="w-[100px] text-right">Hits</TableHead>
          <TableHead className="w-[200px]">Frequency</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {domains.map((domain) => (
          <TableRow key={domain.domain}>
            <TableCell>{domain.domain}</TableCell>
            <TableCell className="text-right">{domain.count}</TableCell>
            <TableCell>
              <Progress 
                value={(domain.count / totalQueries) * 100} 
                className="w-[160px]" 
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
