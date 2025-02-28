"use client";

import Link from 'next/link';
import { useEffect, useState } from "react";
import { getLists, addList, deleteList, List, AddListRequest } from "@/lib/pihole";
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

const Page = () => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [lists, setLists] = useState<List[]>([]);
    const [formData, setFormData] = useState<Partial<AddListRequest>>({
        address: '',
        comment: null,
        groups: [0],
        enabled: true,
        type: 'block'
    });

    useEffect(() => {
        fetchLists();
    }, []);

    const fetchLists = async () => {
        try {
            setLoading(true);
            const response = await getLists();
            setLists(response.lists);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to fetch lists",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

            toast({
                title: "Success",
                description: "List added successfully",
            });

            setFormData(prev => ({
                ...prev,
                address: '',
                comment: null
            }));

            await fetchLists();
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
            await fetchLists();
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

    const formatDate = (timestamp: number) => {
        return new Date(timestamp * 1000).toLocaleString();
    };

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <Heading 
                    title="Subscribed Lists Management"
                    description="Manage your subscribed block and allow lists"
                />
                <Separator />

                <Card>
                    <CardHeader>
                        <CardTitle>Add a new subscribed list</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Input 
                                    placeholder="URL" 
                                    name="address"
                                    value={formData.address as string}
                                    onChange={handleInputChange}
                                />
                                <Input 
                                    placeholder="List description (optional)" 
                                    name="comment"
                                    value={formData.comment || ''}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="flex gap-4 justify-end">
                                <Button onClick={() => handleAddList('block')}>
                                    Add Block List
                                </Button>
                                <Button 
                                    variant="outline" 
                                    onClick={() => handleAddList('allow')}
                                >
                                    Add Allow List
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

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
                                        <TableHead>Invalid Domains</TableHead>
                                        <TableHead>Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center">
                                                Loading...
                                            </TableCell>
                                        </TableRow>
                                    ) : lists.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center">
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
                                                    <span className={list.enabled ? "text-green-600" : "text-red-600"}>
                                                        {list.enabled ? 'Active' : 'Disabled'}
                                                    </span>
                                                </TableCell>
                                                <TableCell>{list.invalid_domains}</TableCell>
                                                <TableCell>
                                                    <Button 
                                                        variant="destructive" 
                                                        size="sm"
                                                        onClick={() => handleDeleteList(list.address, list.type)}
                                                    >
                                                        Delete
                                                    </Button>
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