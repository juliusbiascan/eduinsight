"use client"

import { useEffect, useState } from "react";
import { getDomain } from "@/lib/pihole";
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
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
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
    const [totalEntries, setTotalEntries] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDomains, setSelectedDomains] = useState<Set<string>>(new Set());
    
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

    const fetchDomains = async () => {
        setLoading(true);
        setError(null);
        try {
            const results: DomainEntry[] = [];

            if (filters.exactAllow) {
                const allowExact = await getDomain('allow', 'exact', '');
                results.push(...allowExact.domains);
            }
            if (filters.regexAllow) {
                const allowRegex = await getDomain('allow', 'regex', '');
                results.push(...allowRegex.domains);
            }
            if (filters.exactDeny) {
                const denyExact = await getDomain('deny', 'exact', '');
                results.push(...denyExact.domains);
            }
            if (filters.regexDeny) {
                const denyRegex = await getDomain('deny', 'regex', '');
                results.push(...denyRegex.domains);
            }

            setDomains(results);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch domains');
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

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <Heading
                    title="Domain Management"
                    description="Manage your allow and deny lists for domains. Control access to specific domains using exact matches or regex patterns."
                />
                <Separator />

                <Card className="p-4">
                    <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                Show
                                <Select
                                    value={pageSize.toString()}
                                    onValueChange={(value) => setPageSize(Number(value))}
                                >
                                    <SelectTrigger className="w-[100px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[10, 25, 50, 100].map((size) => (
                                            <SelectItem key={size} value={size.toString()}>
                                                {size}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                entries
                            </div>
                            <AddDomainDialog onSuccess={fetchDomains} />
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="exactAllow"
                                    checked={filters.exactAllow}
                                    onCheckedChange={(checked) =>
                                        setFilters(prev => ({ ...prev, exactAllow: checked === true }))
                                    }
                                />
                                <label htmlFor="exactAllow">Exact Allow</label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="regexAllow"
                                    checked={filters.regexAllow}
                                    onCheckedChange={(checked) =>
                                        setFilters(prev => ({ ...prev, regexAllow: checked === true }))
                                    }
                                />
                                <label htmlFor="regexAllow">Regex Allow</label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="exactDeny"
                                    checked={filters.exactDeny}
                                    onCheckedChange={(checked) =>
                                        setFilters(prev => ({ ...prev, exactDeny: checked === true }))
                                    }
                                />
                                <label htmlFor="exactDeny">Exact Deny</label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="regexDeny"
                                    checked={filters.regexDeny}
                                    onCheckedChange={(checked) =>
                                        setFilters(prev => ({ ...prev, regexDeny: checked === true }))
                                    }
                                />
                                <label htmlFor="regexDeny">Regex Deny</label>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span>Search:</span>
                            <Input
                                type="search"
                                placeholder="Search domains, types, kinds, or comments..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="max-w-sm"
                            />
                        </div>
                        {selectedDomains.size > 0 && (
                            <div className="mt-4 flex items-center gap-2">
                                <Button 
                                    variant="destructive" 
                                    onClick={handleBatchDelete}
                                >
                                    Delete Selected ({selectedDomains.size})
                                </Button>
                            </div>
                        )}
                    </div>
                </Card>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="text-center">Loading domains...</div>
                ) : (
                    <Card>
                        <div className="p-6 pb-2">
                            <h2 className="text-lg font-semibold">List of Domains</h2>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">
                                        <Checkbox
                                            checked={currentDomains.length > 0 && 
                                                currentDomains.every(d => 
                                                    selectedDomains.has(`${d.domain}-${d.id}`)
                                                )}
                                            onCheckedChange={handleSelectAll}
                                        />
                                    </TableHead>
                                    <TableHead>Domain</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Kind</TableHead>
                                    <TableHead>Comment</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Added</TableHead>
                                    <TableHead>Modified</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currentDomains.map((domain) => (
                                    <TableRow key={`${domain.domain}-${domain.id}`}>
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedDomains.has(
                                                    `${domain.domain}-${domain.id}`
                                                )}
                                                onCheckedChange={(checked) =>
                                                    handleSelectDomain(
                                                        `${domain.domain}-${domain.id}`,
                                                        checked === true
                                                    )
                                                }
                                            />
                                        </TableCell>
                                        <TableCell>{domain.unicode || domain.domain}</TableCell>
                                        <TableCell>{domain.type}</TableCell>
                                        <TableCell>{domain.kind}</TableCell>
                                        <TableCell>{domain.comment || '-'}</TableCell>
                                        <TableCell>{domain.enabled ? 'Enabled' : 'Disabled'}</TableCell>
                                        <TableCell>{formatDate(domain.date_added)}</TableCell>
                                        <TableCell>{formatDate(domain.date_modified)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <div className="flex items-center justify-between px-4 py-4">
                            <div className="text-sm text-gray-700">
                                Showing {startIndex + 1} to {endIndex} of {filteredDomains.length} entries
                                {searchQuery && ` (filtered from ${domains.length} total entries)`}
                            </div>
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious 
                                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                            className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                                        />
                                    </PaginationItem>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <PaginationItem key={page}>
                                            <PaginationLink
                                                onClick={() => setCurrentPage(page)}
                                                isActive={currentPage === page}
                                            >
                                                {page}
                                            </PaginationLink>
                                        </PaginationItem>
                                    ))}
                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                            className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default DomainsPage;