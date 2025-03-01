"use client"

import { useEffect, useState } from "react";
import { getGroups, batchDeleteGroups, type Group, deleteGroup } from "@/lib/pihole";
import PageContainer from "@/components/layout/page-container"
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { NewGroupDialog } from "@/components/dialogs/new-group-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { DeleteGroupDialog } from "@/components/dialogs/delete-group-dialog";
import { TrashIcon, PencilIcon, AlertCircle } from "lucide-react";
import { EditGroupDialog } from "@/components/dialogs/edit-group-dialog";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

const ENTRIES_OPTIONS = [10, 25, 50, 100];

const TableLoadingSkeleton = () => {
    return (
        <div className="relative w-full overflow-auto" style={{ height: "calc(100vh - 400px)" }}>
            <div className="space-y-3">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead><Skeleton className="h-4 w-4" /></TableHead>
                            <TableHead><Skeleton className="h-4 w-[100px]" /></TableHead>
                            <TableHead><Skeleton className="h-4 w-[80px]" /></TableHead>
                            <TableHead><Skeleton className="h-4 w-[150px]" /></TableHead>
                            <TableHead><Skeleton className="h-4 w-[100px]" /></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[...Array(5)].map((_, index) => (
                            <TableRow key={index}>
                                <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

const EmptyState = () => (
    <div className="flex flex-col items-center justify-center p-8 text-center h-[300px]">
        <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No groups found</h3>
        <p className="text-sm text-muted-foreground mt-2">
            Start by creating a new group to organize your network devices.
        </p>
    </div>
);

const Page = () => {
    const [groups, setGroups] = useState<Group[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedGroups, setSelectedGroups] = useState<Set<number>>(new Set());
    const [search, setSearch] = useState("");
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState<Group | null>(null);
    const [groupToDelete, setGroupToDelete] = useState<Group | null>(null);

    const fetchGroups = async () => {
        try {
            setIsLoading(true);
            const response = await getGroups();
            setGroups(response.groups);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch groups');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    const filteredGroups = groups.filter(group =>
        group.name.toLowerCase().includes(search.toLowerCase())
    );

    const pageCount = Math.ceil(filteredGroups.length / entriesPerPage);
    const startIndex = (currentPage - 1) * entriesPerPage;
    const endIndex = startIndex + entriesPerPage;
    const currentGroups = filteredGroups.slice(startIndex, endIndex);

    const handleSelectAll = () => {
        if (selectedGroups.size === currentGroups.length) {
            setSelectedGroups(new Set());
        } else {
            setSelectedGroups(new Set(currentGroups.map(g => g.id)));
        }
    };

    const handleDelete = async () => {
        if (selectedGroups.size === 0) return;

        const groupsToDelete = groups
            .filter(group => selectedGroups.has(group.id) && group.name !== 'default')
            .map(group => ({ item: group.name }));

        if (groupsToDelete.length === 0) {
            setError("Cannot delete the default group");
            return;
        }

        await batchDeleteGroups(groupsToDelete);
        setSelectedGroups(new Set());
        await fetchGroups();
    };

    const handleSingleDelete = async (group: Group) => {
        try {
            if (group.name === 'default') {
                throw new Error("Cannot delete the default group");
            }
            await deleteGroup(group.name);
            await fetchGroups();
            setGroupToDelete(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete group');
        }
    };

    const hasNoGroups = !isLoading && groups.length === 0;

    return (
        <PageContainer scrollable={false}>
            <div className='flex flex-1 flex-col space-y-4 h-full'>
                <div className="flex items-start justify-between">
                    <Heading
                        title="Group management"
                        description="Create and manage groups of network devices. "
                    />
                    <div className="flex items-center gap-2">
                        {selectedGroups.size > 0 && (
                            <Button
                                variant="destructive"
                                size="icon"
                                onClick={() => setIsDeleteDialogOpen(true)}
                            >
                                <TrashIcon className="h-4 w-4" />
                            </Button>
                        )}
                        <NewGroupDialog onGroupCreated={fetchGroups} />
                    </div>
                </div>
                <Separator className="my-4" />

                {/* Table Controls */}
                <Card className="flex-1 flex flex-col">
                    <CardHeader>
                        <CardTitle>List of groups</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col space-y-4">
                        {/* Show controls only if we have groups */}
                        {!hasNoGroups && (
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

                        {/* Table Container */}
                        <div className="flex-1 flex flex-col min-h-0">
                            {isLoading ? (
                                <TableLoadingSkeleton />
                            ) : hasNoGroups ? (
                                <EmptyState />
                            ) : filteredGroups.length === 0 ? (
                                <div className="flex flex-col items-center justify-center p-8 text-center h-[300px]">
                                    <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-medium">No results found</h3>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        No groups match your search criteria.
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
                                                            checked={selectedGroups.size === currentGroups.length}
                                                            onCheckedChange={handleSelectAll}
                                                        />
                                                    </TableHead>
                                                    <TableHead>Name</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead>Comment</TableHead>
                                                    <TableHead className="w-[100px]">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {currentGroups.map(group => (
                                                    <TableRow key={group.id}>
                                                        <TableCell>
                                                            <Checkbox
                                                                checked={selectedGroups.has(group.id)}
                                                                onCheckedChange={(checked) => {
                                                                    if (group.name === 'default') return;
                                                                    const newSelected = new Set(selectedGroups);
                                                                    if (checked) {
                                                                        newSelected.add(group.id);
                                                                    } else {
                                                                        newSelected.delete(group.id);
                                                                    }
                                                                    setSelectedGroups(newSelected);
                                                                }}
                                                                disabled={group.name === 'default'}
                                                            />
                                                        </TableCell>
                                                        <TableCell>{group.name}</TableCell>
                                                        <TableCell>
                                                            <Badge variant={group.enabled ? "success" : "destructive"}>
                                                                {group.enabled ? "active" : "inactive"}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>{group.comment || '-'}</TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-1">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => setEditingGroup(group)}
                                                                >
                                                                    <PencilIcon className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => setGroupToDelete(group)}
                                                                    disabled={group.name === 'default'}
                                                                >
                                                                    <TrashIcon className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    {/* Pagination Controls - Keep outside scroll area */}
                                    <div className="mt-4 flex items-center justify-between border-t pt-4">
                                        <div>
                                            Showing {startIndex + 1} to {Math.min(endIndex, filteredGroups.length)} of {filteredGroups.length} entries
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                disabled={currentPage === 1}
                                            >
                                                Previous
                                            </Button>
                                            <span>{currentPage}</span>
                                            <Button
                                                variant="outline"
                                                onClick={() => setCurrentPage(p => Math.min(pageCount, p + 1))}
                                                disabled={currentPage === pageCount}
                                            >
                                                Next
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <DeleteGroupDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                selectedCount={selectedGroups.size}
                onConfirm={handleDelete}
            />

            <DeleteGroupDialog
                open={!!groupToDelete}
                onOpenChange={(open) => !open && setGroupToDelete(null)}
                selectedCount={1}
                onConfirm={() => {
                    if (!groupToDelete) return Promise.resolve();
                    return handleSingleDelete(groupToDelete);
                }}
            />

            {editingGroup && (
                <EditGroupDialog
                    group={editingGroup}
                    open={!!editingGroup}
                    onOpenChange={(open) => !open && setEditingGroup(null)}
                    onGroupUpdated={fetchGroups}
                />
            )}
        </PageContainer>
    );
}

export default Page;