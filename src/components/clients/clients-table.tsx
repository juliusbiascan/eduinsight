import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { TopClient } from "@/lib/pihole";

interface ClientsTableProps {
    clients: TopClient[];
    totalQueries: number;
}

export function ClientsTable({
    clients,
    totalQueries,
}: ClientsTableProps) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead className="w-[100px] text-right">Request</TableHead>
                    <TableHead className="w-[200px]">Frequency</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {clients.map((client) => (
                    <TableRow key={client.ip}>
                        <TableCell>{client.name || client.ip}</TableCell>
                        <TableCell className="text-right">{client.count.toLocaleString()}</TableCell>
                        <TableCell>
                            <Progress 
                                value={(client.count / totalQueries) * 100} 
                                className="w-[160px]" 
                            />
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
