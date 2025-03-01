"use client"

import { useEffect, useState } from "react";
import { getAllDomains, getGroups, Group, updateDomain } from "@/lib/pihole";
import { DomainEntry } from "@/lib/pihole";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { addDomain, batchDeleteDomains } from "@/lib/pihole";
import { toast } from "sonner";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { FileSpreadsheet, Globe, Shield, Search } from "lucide-react";
import PageContainer from "@/components/layout/page-container";
import * as XLSX from 'xlsx';
import { GroupsCell } from '@/components/cells/groups-cell';
import { MultiSelect } from "@/components/ui/multi-select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Filter } from "lucide-react";

interface FormData {
    domain: string;
    comment: string;
    groups: number[];
    enabled: boolean;
    type: 'allow' | 'deny';
    kind: 'exact' | 'regex';
}

const AddDomainDialog = ({ onSuccess }: { onSuccess: () => void }) => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        domain: '',
        comment: '',
        groups: [0],
        enabled: true,
        type: 'allow',
        kind: 'exact'
    });
    const [availableGroups, setAvailableGroups] = useState<Group[]>([]);

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const response = await getGroups();
                setAvailableGroups(response.groups);
            } catch (error) {
                toast.error('Failed to fetch groups');
            }
        };
        fetchGroups();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await addDomain(formData.type, formData.kind, {
                domain: formData.domain,
                comment: formData.comment || null,
                groups: formData.groups,
                enabled: formData.enabled
            });
            
            if (response.processed?.success.length) {
                toast.success('Domain added successfully');
                setOpen(false);
                onSuccess();
            } else if (response.processed?.errors.length) {
                toast.error(response.processed.errors[0].error);
            }
        } catch (error) {
            toast.error('Failed to add domain');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>Add Domain</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Domain</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="domain">Domain</label>
                        <Input
                            id="domain"
                            value={formData.domain}
                            onChange={(e) => setFormData(prev => ({ ...prev, domain: e.target.value }))}
                            placeholder="example.com"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="comment">Comment</label>
                        <Input
                            id="comment"
                            value={formData.comment}
                            onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                            placeholder="Optional comment"
                        />
                    </div>
                    <div className="flex gap-4">
                        <div className="flex items-center space-x-2">
                            <Select
                                value={formData.type}
                                onValueChange={(value: 'allow' | 'deny') => 
                                    setFormData(prev => ({ ...prev, type: value }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="allow">Allow</SelectItem>
                                    <SelectItem value="deny">Deny</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Select
                                value={formData.kind}
                                onValueChange={(value: 'exact' | 'regex') => 
                                    setFormData(prev => ({ ...prev, kind: value }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Kind" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="exact">Exact</SelectItem>
                                    <SelectItem value="regex">Regex</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="groups">Groups</label>
                        <MultiSelect
                            options={availableGroups.map(group => ({
                                label: group.name || `Group ${group.id}`,
                                value: group.id.toString()
                            }))}
                            value={formData.groups.map(String)}
                            onValueChange={(values) => setFormData(prev => ({
                                ...prev,
                                groups: values.map(Number)
                            }))}
                            placeholder="Select groups..."
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="enabled"
                            checked={formData.enabled}
                            onCheckedChange={(checked) =>
                                setFormData(prev => ({ ...prev, enabled: checked === true }))
                            }
                        />
                        <label htmlFor="enabled">Enabled</label>
                    </div>
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Adding...' : 'Add Domain'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
};

const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 space-y-3 border animate-pulse">
                <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700" />
                    <div className="space-y-2 flex-1">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                </div>
            </div>
        ))}
    </div>
);

const DomainsPage = () => {
    const [domains, setDomains] = useState<DomainEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState({
        exactAllow: true,
        regexAllow: true,
        exactDeny: true,
        regexDeny: true,
    });
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDomains, setSelectedDomains] = useState<Set<string>>(new Set());
    const [availableGroups, setAvailableGroups] = useState<Group[]>([]);

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedDomains(new Set(currentDomains.map(d => `${d.domain}-${d.id}`)));
        } else {
            setSelectedDomains(new Set());
        }
    };

    const handleSelectDomain = (domainId: string, checked: boolean) => {
        const newSelection = new Set(selectedDomains);
        if (checked) {
            newSelection.add(domainId);
        } else {
            newSelection.delete(domainId);
        }
        setSelectedDomains(newSelection);
    };

    const handleBatchDelete = async () => {
        if (selectedDomains.size === 0) return;

        const deleteItems = Array.from(selectedDomains).map(id => {
            const domain = domains.find(d => `${d.domain}-${d.id}` === id);
            if (!domain) throw new Error('Domain not found');
            return {
                item: domain.domain,
                type: domain.type,
                kind: domain.kind
            };
        });

        try {
            const response = await batchDeleteDomains(deleteItems);
            if (response === 204) {
                toast.success('Selected domains were successfully deleted');
                setSelectedDomains(new Set());
                fetchDomains();
            } else if(response === 404) {
                toast.error('Item not found');
            }
        } catch (error) {
            toast.error('Failed to delete domains');
        }
    };

    const handleGroupUpdate = async (domainId: number, groups: string[], domainIdentifier: string) => {
        const domain = domains.find(d => d.id === domainId);
        if (!domain) return;

        try {
            await updateDomain(domain.type, domain.kind, domain.domain, {
                type: domain.type,
                kind: domain.kind,
                comment: domain.comment,
                groups: groups.map(Number),
                enabled: domain.enabled
            });
            
            await fetchDomains(); // Refresh the domains list
            toast.success('Groups updated successfully');
        } catch (error) {
            toast.error('Failed to update groups');
        }
    };

    const fetchDomains = async () => {
        setLoading(true);
        setError(null);
        try {
            const [domainsResponse, groupsResponse] = await Promise.all([
                getAllDomains(),
                getGroups()
            ]);
            
            const results = domainsResponse.domains.filter(domain => {
                if (domain.type === 'allow' && domain.kind === 'exact' && !filters.exactAllow) return false;
                if (domain.type === 'allow' && domain.kind === 'regex' && !filters.regexAllow) return false;
                if (domain.type === 'deny' && domain.kind === 'exact' && !filters.exactDeny) return false;
                if (domain.type === 'deny' && domain.kind === 'regex' && !filters.regexDeny) return false;
                return true;
            });
            setDomains(results);
            setAvailableGroups(groupsResponse.groups);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    // Filter domains based on search query
    const filteredDomains = domains.filter(domain => {
        const searchLower = searchQuery.toLowerCase();
        return (
            domain.domain.toLowerCase().includes(searchLower) ||
            domain.type.toLowerCase().includes(searchLower) ||
            domain.kind.toLowerCase().includes(searchLower) ||
            (domain.comment && domain.comment.toLowerCase().includes(searchLower))
        );
    });

    // Update pagination calculations to use filtered results
    const totalPages = Math.ceil(filteredDomains.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, filteredDomains.length);
    const currentDomains = filteredDomains.slice(startIndex, endIndex);

    useEffect(() => {
        fetchDomains();
    }, [filters]);

    useEffect(() => {
        setCurrentPage(1); // Reset to first page when filters change
    }, [filters, pageSize]);

    // Reset page when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const formatDate = (timestamp: number) => {
        return new Date(timestamp * 1000).toLocaleString();
    };

    const renderFilters = () => (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Tabs defaultValue="all" className="w-auto">
                    <TabsList>
                        <TabsTrigger 
                            value="all" 
                            onClick={() => setFilters({
                                exactAllow: true,
                                regexAllow: true,
                                exactDeny: true,
                                regexDeny: true,
                            })}
                        >
                            All
                        </TabsTrigger>
                        <TabsTrigger 
                            value="allow" 
                            onClick={() => setFilters({
                                exactAllow: true,
                                regexAllow: true,
                                exactDeny: false,
                                regexDeny: false,
                            })}
                        >
                            Allow List
                        </TabsTrigger>
                        <TabsTrigger 
                            value="deny" 
                            onClick={() => setFilters({
                                exactAllow: false,
                                regexAllow: false,
                                exactDeny: true,
                                regexDeny: true,
                            })}
                        >
                            Deny List
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search domains..."
                            className="pl-8 w-[200px] lg:w-[300px]"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <Select value={pageSize.toString()} onValueChange={(v) => setPageSize(Number(v))}>
                        <SelectTrigger className="w-[100px]">
                            <SelectValue placeholder="Show" />
                        </SelectTrigger>
                        <SelectContent>
                            {[10, 20, 50, 100].map(size => (
                                <SelectItem key={size} value={size.toString()}>
                                    {size} items
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                                <Filter className="h-4 w-4 mr-2" />
                                Filters
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-sm">
                            <DialogHeader>
                                <DialogTitle>Filter Domains</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Allow List</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox 
                                                checked={filters.exactAllow}
                                                onCheckedChange={(checked) => 
                                                    setFilters(prev => ({ ...prev, exactAllow: checked === true }))
                                                }
                                            />
                                            <label className="text-sm">Exact Match</label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox 
                                                checked={filters.regexAllow}
                                                onCheckedChange={(checked) => 
                                                    setFilters(prev => ({ ...prev, regexAllow: checked === true }))
                                                }
                                            />
                                            <label className="text-sm">Regex</label>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Deny List</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox 
                                                checked={filters.exactDeny}
                                                onCheckedChange={(checked) => 
                                                    setFilters(prev => ({ ...prev, exactDeny: checked === true }))
                                                }
                                            />
                                            <label className="text-sm">Exact Match</label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox 
                                                checked={filters.regexDeny}
                                                onCheckedChange={(checked) => 
                                                    setFilters(prev => ({ ...prev, regexDeny: checked === true }))
                                                }
                                            />
                                            <label className="text-sm">Regex</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    <Checkbox
                        checked={selectedDomains.size === currentDomains.length && currentDomains.length > 0}
                        onCheckedChange={handleSelectAll}
                        id="select-all"
                    />
                    <label htmlFor="select-all" className="text-sm">
                        Select All
                    </label>
                </div>
                {selectedDomains.size > 0 && (
                    <Button 
                        variant="destructive" 
                        onClick={handleBatchDelete}
                        size="sm"
                    >
                        Delete Selected ({selectedDomains.size})
                    </Button>
                )}
            </div>
        </div>
    );

    const PaginationControls = () => (
        <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-500">
                Showing {startIndex + 1}-{endIndex} of {filteredDomains.length} domains
            </div>
            <div className="flex gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                >
                    Previous
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                >
                    Next
                </Button>
            </div>
        </div>
    );

    return (
        <PageContainer scrollable={false}>
            <div className="flex flex-1 flex-col space-y-4">
                <div className="flex items-start justify-between">
                    <Heading
                        title="Domains"
                        description="Manage domain filtering rules"
                    />
                    <AddDomainDialog onSuccess={fetchDomains} />
                </div>
                <Separator />

                <Card>
                    <CardHeader className="pb-3">
                    {renderFilters()}
                        <Separator className="mt-4" />
                    </CardHeader>

                    <CardContent>
                        {error && (
                            <div className="text-red-500 p-4 text-center bg-red-50 rounded-lg mb-4">
                                {error}
                            </div>
                        )}
                        
                        {loading ? (
                            <LoadingSkeleton />
                        ) : (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
                                    {currentDomains.map((domain) => (
                                        <motion.div
                                            key={`${domain.domain}-${domain.id}`}
                                            whileHover={{ scale: 1.02 }}
                                            className="rounded-lg shadow-sm p-4 border relative flex flex-col h-full"
                                        >
                                            <div className="absolute top-4 left-4">
                                                <Checkbox
                                                    checked={selectedDomains.has(`${domain.domain}-${domain.id}`)}
                                                    onCheckedChange={(checked) =>
                                                        handleSelectDomain(`${domain.domain}-${domain.id}`, checked === true)
                                                    }
                                                />
                                            </div>

                                            <div className="flex items-center justify-between pl-8 mb-3">
                                                <div className="flex items-center space-x-3">
                                                    {domain.type === 'allow' ? (
                                                        <Globe className="h-5 w-5" />
                                                    ) : (
                                                        <Shield className="h-5 w-5" />
                                                    )}
                                                    <div>
                                                        <h3 className="font-medium truncate">
                                                            {domain.unicode || domain.domain}
                                                        </h3>
                                                        <p className="text-sm text-muted-foreground truncate">
                                                            {domain.type} - {domain.kind}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge
                                                    variant={domain.enabled ? "outline" : "secondary"}
                                                    className="text-xs"
                                                >
                                                    {domain.enabled ? "Enabled" : "Disabled"}
                                                </Badge>
                                            </div>

                                            {domain.comment && (
                                                <p className="text-sm text-muted-foreground mb-3">
                                                    {domain.comment}
                                                </p>
                                            )}

                                            <div className="text-xs text-muted-foreground space-y-1 mb-3">
                                                <div>Added: {new Date(domain.date_added * 1000).toLocaleString()}</div>
                                                <div>Modified: {new Date(domain.date_modified * 1000).toLocaleString()}</div>
                                            </div>

                                            <div className="pt-2 border-t mt-auto">
                                                <GroupsCell
                                                    clientId={domain.id}
                                                    clientIdentifier={domain.domain}
                                                    groups={domain.groups.map(String)}
                                                    availableGroups={availableGroups}
                                                    onUpdate={handleGroupUpdate}
                                                />
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                                <PaginationControls />
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </PageContainer>
    );
};

export default DomainsPage;