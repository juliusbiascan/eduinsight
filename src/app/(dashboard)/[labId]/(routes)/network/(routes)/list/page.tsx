"use client";

import Link from 'next/link';
import { useEffect, useState } from "react";
import { getLists, addList, deleteList, updateList, List, AddListRequest, getGroups, Group } from "@/lib/pihole";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { GroupsCell } from '@/components/cells/groups-cell';
import { NewListDialog } from "@/components/dialogs/new-list-dialog";
import { TableSkeleton } from "@/components/skeletons/table-skeleton";
import { GravityUpdateDialog } from "@/components/dialogs/gravity-update-dialog";

const Page = () => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [lists, setLists] = useState<List[]>([]);
    const [availableGroups, setAvailableGroups] = useState<Group[]>([]);

    useEffect(() => {
        const init = async () => {
            try {
                setLoading(true);
                const [listsResponse, groupsResponse] = await Promise.all([
                    getLists(),
                    getGroups()
                ]);
                setLists(listsResponse.lists);
                setAvailableGroups(groupsResponse.groups);
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to fetch data",
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    const refreshLists = async () => {
        try {
            const response = await getLists();
            setLists(response.lists);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to refresh lists",
                variant: "destructive"
            });
        }
    };

    const handleDeleteList = async (address: string, type: 'allow' | 'block') => {
        try {
            setActionLoading(true);
            await deleteList(address, type);
            await refreshLists();

            toast({
                title: "Success",
                description: "List deleted successfully",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete list",
                variant: "destructive"
            });
        } finally {
            setActionLoading(false);
        }
    };

    const handleGroupUpdate = async (listId: number, address: string, type: 'allow' | 'block', newGroups: string[]) => {
        try {
            setActionLoading(true);
            const list = lists.find(l => l.id === listId);
            if (!list) return;

            const groupIds = newGroups.map(Number);
            await updateList(address, type, {
                comment: list.comment,
                type: type,
                groups: groupIds,
                enabled: list.enabled
            });

            await refreshLists();

            toast({
                title: "Success",
                description: "List updated successfully",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to update list",
                variant: "destructive"
            });
        } finally {
            setActionLoading(false);
        }
    };

    const handleToggleEnabled = async (list: List) => {
        try {
            setActionLoading(true);
            await updateList(list.address, list.type, {
                comment: list.comment,
                type: list.type,
                groups: list.groups,
                enabled: !list.enabled
            });

            await refreshLists();

            toast({
                title: "Success",
                description: `List ${!list.enabled ? 'enabled' : 'disabled'} successfully`,
            });
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to update list status",
                variant: "destructive"
            });
        } finally {
            setActionLoading(false);
        }
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp * 1000).toLocaleString();
    };

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-start justify-between">
                    <Heading
                        title="Subscribed Lists Management"
                        description="Manage your subscribed block and allow lists"
                    />
                    <div className="flex items-center gap-2">
                        <GravityUpdateDialog />
                        <NewListDialog 
                            availableGroups={availableGroups}
                            onListCreated={async () => {
                                const response = await getLists();
                                setLists(response.lists);
                            }}
                        />
                    </div>
                </div>
                <Separator />

                <Alert>
                    <InfoIcon className="h-4 w-4" />
                    <AlertDescription>
                        Please run eduinsight -g or update your gravity list online after modifying your lists.
                        Multiple lists can be added by separating each unique URL with a space or comma.
                        Click on the icon in the first column to get additional information about your lists.
                        The icons correspond to the health of the list.
                    </AlertDescription>
                </Alert>

                <Card>
                    <CardHeader>
                        <CardTitle>Subscribed Lists</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    Show
                                    <Select defaultValue="10">
                                        <SelectTrigger className="w-[70px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="10">10</SelectItem>
                                            <SelectItem value="25">25</SelectItem>
                                            <SelectItem value="50">50</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    entries
                                </div>
                            </div>

                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Updated At</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Address</TableHead>
                                        <TableHead>Comment</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading || actionLoading ? (
                                        <TableSkeleton />
                                    ) : lists.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center">
                                                No lists found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        lists.map((list) => (
                                            <TableRow key={list.id}>
                                                <TableCell>{formatDate(list.date_updated)}</TableCell>
                                                <TableCell>{list.type}</TableCell>
                                                <TableCell className="max-w-[200px] truncate">
                                                    <Link
                                                        href={list.address}
                                                        target="_blank"
                                                        className="text-blue-600 hover:text-blue-800 hover:underline"
                                                    >
                                                        {list.address}
                                                    </Link>
                                                </TableCell>
                                                <TableCell>{list.comment || '-'}</TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleToggleEnabled(list)}
                                                    >
                                                        <span className={list.enabled ? "text-green-600" : "text-red-600"}>
                                                            {list.enabled ? 'Active' : 'Disabled'}
                                                        </span>
                                                    </Button>
                                                </TableCell>
                                                <TableCell>
                                                    <GroupsCell
                                                        clientId={list.id}
                                                        clientIdentifier={list.address}
                                                        groups={list.groups.map(String)}
                                                        availableGroups={availableGroups}
                                                        onUpdate={(id, newGroups) => handleGroupUpdate(id, list.address, list.type, newGroups)}
                                                        onDelete={() => handleDeleteList(list.address, list.type)}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>

                            <div className="flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">
                                    Showing {lists.length} {lists.length === 1 ? 'entry' : 'entries'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default Page;