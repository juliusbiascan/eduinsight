"use client"

import { useEffect, useState } from "react";
import PageContainer from "@/components/layout/page-container";
import { NewClientDialog } from "@/components/dialogs/new-client-dialog";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { getClients, type ClientData, getGroups, Group, deleteClient, deleteClients } from "@/lib/pihole";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { AlertCircle } from "lucide-react";
import { GroupsCell } from "@/components/cells/groups-cell";
import { updateClient } from "@/lib/pihole";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

const ENTRIES_OPTIONS = [10, 25, 50, 100];

const TableLoadingSkeleton = () => (
    <div className="relative w-full overflow-auto" style={{ height: "calc(100vh - 400px)" }}>
        <div className="space-y-3">
            <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead><Skeleton className="h-4 w-[100px]" /></TableHead>
                        <TableHead><Skeleton className="h-4 w-[150px]" /></TableHead>
                        <TableHead><Skeleton className="h-4 w-[150px]" /></TableHead>
                        <TableHead><Skeleton className="h-4 w-[100px]" /></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {[...Array(5)].map((_, index) => (
                        <TableRow key={index}>
                            <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    </div>
);

const EmptyState = () => (
    <div className="flex flex-col items-center justify-center p-8 text-center h-[300px]">
        <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No clients found</h3>
        <p className="text-sm text-muted-foreground mt-2">
            There are no clients registered in the system.
        </p>
    </div>
);

const Page = () => {
    const [clients, setClients] = useState<ClientData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const { toast } = useToast();
    const [availableGroups, setAvailableGroups] = useState<Group[]>([]);
    const [selectedClients, setSelectedClients] = useState<Set<number>>(new Set());
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const fetchClients = async () => {
        try {
            setIsLoading(true);
            const response = await getClients();
            setClients(response.clients);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch clients');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGroupUpdate = async (clientId: number, newGroups: string[], clientIdentifier: string) => {
        try {
            const groupIds = newGroups.map(Number);
            await updateClient(clientIdentifier, {
                groups: groupIds, 
            });
            
            setClients(currentClients => 
                currentClients.map(client => 
                    client.id === clientId 
                        ? { ...client, groups: groupIds }
                        : client
                )
            );

            toast({
                title: "Success",
                description: "Groups updated successfully"
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to update groups"
            });
            throw error; // Re-throw to handle in the component
        }
    };

    const handleDeleteClient = async (clientId: number, clientIdentifier: string) => {
        try {
            await deleteClient(clientIdentifier);
            
            // Update local state by removing the deleted client
            setClients(currentClients => 
                currentClients.filter(client => client.id !== clientId)
            );

            toast({
                title: "Success",
                description: "Client deleted successfully"
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to delete client"
            });
            throw error;
        }
    };

    const handleSelectAll = (checked: boolean | "indeterminate") => {
        if (checked === true) {
            setSelectedClients(new Set(currentClients.map(client => client.id)));
        } else {
            setSelectedClients(new Set());
        }
    };

    const handleSelectClient = (clientId: number, checked: boolean | "indeterminate") => {
        const newSelected = new Set(selectedClients);
        if (checked === true) {
            newSelected.add(clientId);
        } else {
            newSelected.delete(clientId);
        }
        setSelectedClients(newSelected);
    };

    const handleBatchDelete = async () => {
        try {
            const clientsToDelete = clients
                .filter(client => selectedClients.has(client.id))
                .map(client => ({ item: client.client }));

            await deleteClients(clientsToDelete);
            
            setClients(currentClients => 
                currentClients.filter(client => !selectedClients.has(client.id))
            );

            setSelectedClients(new Set());
            setIsDeleteDialogOpen(false);

            toast({
                title: "Success",
                description: "Selected clients deleted successfully"
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to delete clients"
            });
        }
    };

    useEffect(() => {
        const init = async () => {
            try {
                setIsLoading(true);
                const [clientsResponse, groupsResponse] = await Promise.all([
                    getClients(),
                    getGroups()
                ]);
                setClients(clientsResponse.clients);
                setAvailableGroups(groupsResponse.groups);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch data');
            } finally {
                setIsLoading(false);
            }
        };

        init();
    }, []);

    const filteredClients = clients.filter(client =>
        client.client.toLowerCase().includes(search.toLowerCase()) ||
        (client.name?.toLowerCase().includes(search.toLowerCase())) ||
        (client.comment?.toLowerCase().includes(search.toLowerCase()))
    );

    const pageCount = Math.ceil(filteredClients.length / entriesPerPage);
    const startIndex = (currentPage - 1) * entriesPerPage;
    const endIndex = startIndex + entriesPerPage;
    const currentClients = filteredClients.slice(startIndex, endIndex);

    const hasNoClients = !isLoading && clients.length === 0;

    return (
        <PageContainer scrollable={false}>
            <div className='flex flex-1 flex-col space-y-4'>
                <div className="flex items-start justify-between">
                    <Heading
                        title="Client management"
                        description="Manage network clients and their group assignments."
                    />
                    <NewClientDialog onClientCreated={fetchClients} />
                </div>
                <Separator className="my-4" />

                <Card className="flex-1 flex flex-col">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>List of clients</CardTitle>
                            {selectedClients.size > 0 && (
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => setIsDeleteDialogOpen(true)}
                                >
                                    Delete Selected ({selectedClients.size})
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col space-y-4">
                        {!hasNoClients && (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm">Show</span>
                                    <Select
                                        value={entriesPerPage.toString()}
                                        onValueChange={(value) => setEntriesPerPage(Number(value))}
                                    >
                                        <SelectTrigger className="w-[70px]">
                                            <SelectValue placeholder="10" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                {ENTRIES_OPTIONS.map(option => (
                                                    <SelectItem key={option} value={option.toString()}>
                                                        {option}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                    <span className="text-sm">entries</span>
                                </div>
                                <Input
                                    placeholder="Search..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="max-w-xs"
                                />
                            </div>
                        )}

                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="flex-1 flex flex-col min-h-0">
                            {isLoading ? (
                                <TableLoadingSkeleton />
                            ) : hasNoClients ? (
                                <EmptyState />
                            ) : filteredClients.length === 0 ? (
                                <div className="flex flex-col items-center justify-center p-8 text-center h-[300px]">
                                    <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-medium">No results found</h3>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        No clients match your search criteria.
                                    </p>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col min-h-0">
                                    <div className="relative w-full flex-1 overflow-auto">
                                        <Table>
                                            <TableHeader className="sticky top-0 z-10">
                                                <TableRow>
                                                    <TableHead className="w-[50px]">
                                                        <Checkbox
                                                            checked={currentClients.length > 0 && currentClients.every(client => selectedClients.has(client.id))}
                                                            onCheckedChange={handleSelectAll}
                                                            aria-label="Select all"
                                                        />
                                                    </TableHead>
                                                    <TableHead>Client</TableHead>
                                                    <TableHead>Hostname</TableHead>
                                                    <TableHead>Comment</TableHead>
                                                    <TableHead>Groups assignments</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {currentClients.map(client => (
                                                    <TableRow key={client.id}>
                                                        <TableCell>
                                                            <Checkbox
                                                                checked={selectedClients.has(client.id)}
                                                                onCheckedChange={(checked) => handleSelectClient(client.id, checked)}
                                                                aria-label={`Select ${client.client}`}
                                                            />
                                                        </TableCell>
                                                        <TableCell>{client.client}</TableCell>
                                                        <TableCell>{client.name || '-'}</TableCell>
                                                        <TableCell>{client.comment || '-'}</TableCell>
                                                        <TableCell>
                                                            <GroupsCell
                                                                clientId={client.id}
                                                                clientIdentifier={client.client}
                                                                groups={client.groups.map(String)}
                                                                availableGroups={availableGroups}
                                                                onUpdate={handleGroupUpdate}
                                                                onDelete={handleDeleteClient}
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    <div className="mt-4 flex items-center justify-between border-t pt-4">
                                        <div>
                                            Showing {startIndex + 1} to {Math.min(endIndex, filteredClients.length)} of {filteredClients.length} entries
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                disabled={currentPage === 1}
                                            >
                                                Previous
                                            </button>
                                            <span>{currentPage}</span>
                                            <button
                                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                                onClick={() => setCurrentPage(p => Math.min(pageCount, p + 1))}
                                                disabled={currentPage === pageCount}
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Selected Clients</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete {selectedClients.size} selected client(s)? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={handleBatchDelete}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </PageContainer>
    );
}

export default Page;



