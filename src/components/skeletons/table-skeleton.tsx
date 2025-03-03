import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead><Skeleton className="h-4 w-[120px]" /></TableHead>
                    <TableHead><Skeleton className="h-4 w-[60px]" /></TableHead>
                    <TableHead><Skeleton className="h-4 w-[180px]" /></TableHead>
                    <TableHead><Skeleton className="h-4 w-[140px]" /></TableHead>
                    <TableHead><Skeleton className="h-4 w-[80px]" /></TableHead>
                    <TableHead><Skeleton className="h-4 w-[100px]" /></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {Array.from({ length: rows }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-[140px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[50px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[160px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                        <TableCell>
                            <div className="flex space-x-2">
                                <Skeleton className="h-7 w-7 rounded-md" />
                                <Skeleton className="h-7 w-7 rounded-md" />
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};
