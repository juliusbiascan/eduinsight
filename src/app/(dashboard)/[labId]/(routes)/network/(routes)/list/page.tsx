"use client";

import Link from 'next/link';
import { useEffect, useState } from "react";
import { getLists, addList, deleteList, updateList, List, AddListRequest, getGroups, Group } from "@/lib/pihole";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
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
import { MultiSelect } from '@/components/ui/multi-select';
import { Textarea } from "@/components/ui/textarea"; // Add this import
import { NewListDialog } from "@/components/dialogs/new-list-dialog";

const Page = () => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [lists, setLists] = useState<List[]>([]);
    const [availableGroups, setAvailableGroups] = useState<Group[]>([]);
    const [formData, setFormData] = useState<Partial<AddListRequest>>({
        address: '',
        comment: null,
        groups: [0],
        enabled: true,
        type: 'block'
    });

    const groupOptions = availableGroups.map(group => ({
        label: group.name || `Group ${group.id}`,
        value: group.id.toString(),
    }));

    const handleGroupSelection = (selectedGroups: string[]) => {
        setFormData(prev => ({
            ...prev,
            groups: selectedGroups.map(Number)
        }));
    };

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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const value = e.target.value;
        setFormData(prev => ({
            ...prev,
            [e.target.name]: value === '' ? null : value
        }));
    };

    const handleAddList = async (type: 'allow' | 'block') => {
        try {
            if (!formData.address) {
                toast({
                    title: "Error",
                    description: "Address is required",
                    variant: "destructive"
                });
                return;
            }

            const addresses = typeof formData.address === 'string'
                ? formData.address.split(/[\s,]+/).filter(Boolean)
                : formData.address;

            await addList({
                ...formData,
                type,
                address: addresses
            } as AddListRequest);

            // Fetch updated lists
            const updatedListsResponse = await getLists();
            setLists(updatedListsResponse.lists);

            toast({
                title: "Success",
                description: "List added successfully",
            });

            // Reset form
            setFormData({
                address: '',
                comment: null,
                groups: [0],
                enabled: true,
                type: 'block'
            });

        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to add list",
                variant: "destructive"
            });
        }
    };

    const handleDeleteList = async (address: string, type: 'allow' | 'block') => {
        try {
            await deleteList(address, type);

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
        }
    };

    const handleGroupUpdate = async (listId: number, address: string, type: 'allow' | 'block', newGroups: string[]) => {
        try {
            const list = lists.find(l => l.id === listId);
            if (!list) return;

            const groupIds = newGroups.map(Number);
            const response = await updateList(address, type, {
                comment: list.comment,
                type: type,
                groups: groupIds,
                enabled: list.enabled
            });

            // Update local state with the response data
            setLists(currentLists =>
                currentLists.map(l => {
                    const updatedList = response.lists.find(rl => rl.id === l.id);
                    return updatedList || l;
                })
            );

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
        }
    };

    const handleToggleEnabled = async (list: List) => {
        try {
            const response = await updateList(list.address, list.type, {
                comment: list.comment,
                type: list.type,
                groups: list.groups,
                enabled: !list.enabled
            });

            setLists(currentLists =>
                currentLists.map(l => {
                    const updatedList = response.lists.find(rl => rl.id === l.id);
                    return updatedList || l;
                })
            );

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
                    <NewListDialog 
                        availableGroups={availableGroups}
                        onListCreated={async () => {
                            const response = await getLists();
                            setLists(response.lists);
                        }}
                    />
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
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center">
                                                Loading...
                                            </TableCell>
                                        </TableRow>
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