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
    isBlocked?: boolean;
}

export function ClientsTable({
    clients,
    totalQueries,
    isBlocked = false,
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
                {clients.map((client) => {

                    const percentage = (client.count / totalQueries) * 100;

                    return (<TableRow key={client.ip}>
                        <TableCell>{client.name || client.ip}</TableCell>
                        <TableCell className="text-right">{client.count.toLocaleString()}</TableCell>
                        <TableCell>
                            <Progress
                                value={percentage}
                                className={`w-[160px] ${isBlocked ? '[&>[role=progressbar]]:bg-destructive' : '[&>[role=progressbar]]:bg-emerald-500'}`}
                            />
                        </TableCell>
                    </TableRow>)
                })}
            </TableBody>
        </Table>
    );
}
