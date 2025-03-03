import { useQueryLogs } from "@/hooks/use-query-logs";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Loader2, Check, Ban, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Label } from "@/components/ui/label";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { addDomain } from "@/lib/pihole";
import { toast } from "sonner";
import { QueryLogsSkeleton } from "@/components/skeletons/query-logs-skeleton";

function PaginationNumbers({ currentPage, totalPages, onPageChange }: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const getPageNumbers = () => {
    const delta = 2; // Number of pages to show before and after current page
    const pages: (number | string)[] = [];

    // Always add first page
    pages.push(1);

    // Calculate range around current page
    const rangeStart = Math.max(2, currentPage - delta);
    const rangeEnd = Math.min(totalPages - 1, currentPage + delta);

    // Add ellipsis after first page if needed
    if (rangeStart > 2) {
      pages.push('...');
    }

    // Add pages around current page
    for (let i = rangeStart; i <= rangeEnd; i++) {
      pages.push(i);
    }

    // Add ellipsis before last page if needed
    if (rangeEnd < totalPages - 1) {
      pages.push('...');
    }

    // Always add last page if not already included
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <>
      {getPageNumbers().map((pageNum, index) => {
        if (pageNum === '...') {
          return (
            <PaginationItem key={`ellipsis-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          );
        }

        return (
          <PaginationItem key={pageNum}>
            <PaginationLink
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onPageChange(pageNum as number);
              }}
              isActive={currentPage === pageNum}
            >
              {pageNum}
            </PaginationLink>
          </PaginationItem>
        );
      })}
    </>
  );
}

export function QueryLogs() {
  const {
    queries,
    loading,
    error,
    setFilters,
    refresh,
    diskMode,
    setDiskMode,
    liveUpdate,
    setLiveUpdate,
    dateRange,
    setDateRange,
    page,
    setPage,
    entriesPerPage,
    setEntriesPerPage,
    totalRecords,
    filteredRecords,
    suggestions = {
      domain: [],
      client_ip: [],
      client_name: [],
      upstream: [],
      type: [],
      status: [],
      reply: [],
      dnssec: []
    }
  } = useQueryLogs(5000, {
    entriesPerPage: 10,
    liveUpdate: false,
    diskMode: false
  });

  const filterOptions = {
    types: [
      { value: "ALL", label: "All Types" },
      ...(suggestions.type || []).map(type => ({ value: type, label: type }))
    ],
    status: [
      { value: "ALL", label: "All Status" },
      ...(suggestions.status || []).map(status => ({ value: status, label: status }))
    ],
    reply: [
      { value: "ALL", label: "All Reply Types" },
      ...(suggestions.reply || []).map(reply => ({ value: reply, label: reply }))
    ],
    dnssec: [
      { value: "ALL", label: "All DNSSEC Status" },
      ...(suggestions.dnssec || []).map(dnssec => ({ value: dnssec, label: dnssec }))
    ]
  };

  const {
    domain: domainSuggestions = [],
    client_ip: clientIPSuggestions = [],
    client_name: clientNameSuggestions = [],
    upstream: upstreamSuggestions = []
  } = suggestions || {};

  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<string>("ALL");
  const [selectedClientIP, setSelectedClientIP] = useState<string>("ALL");
  const [selectedClientName, setSelectedClientName] = useState<string>("ALL");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedDnssec, setSelectedDnssec] = useState<string>("ALL");
  const [selectedReply, setSelectedReply] = useState<string>("ALL");
  const [selectedUpstream, setSelectedUpstream] = useState<string>("ALL");
  const [actionDomain, setActionDomain] = useState<{
    domain: string;
    action: 'allow' | 'deny';
  } | null>(null);

  const handleFilterChange = (key: string, value: string) => {
    const filterValue = value === "ALL" ? undefined : value;
    setFilters(prev => ({ ...prev, [key]: filterValue }));
    setPage(1); // Reset to first page when changing filters
  };

  const handleDomainChange = (value: string) => {
    setSelectedDomain(value);
    handleFilterChange('domain', value);
  };

  const handleClientIPChange = (value: string) => {
    setSelectedClientIP(value);
    handleFilterChange('client_ip', value);
  };

  const handleClientNameChange = (value: string) => {
    setSelectedClientName(value);
    handleFilterChange('client_name', value);
  };

  const handleUpstreamChange = (value: string) => {
    setSelectedUpstream(value);
    handleFilterChange('upstream', value);
  };

  const handleTypeChange = (value: string) => {
    setSelectedType(value);
    handleFilterChange('type', value);
  };

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
    handleFilterChange('status', value);
  };

  const handleReplyChange = (value: string) => {
    setSelectedReply(value);
    handleFilterChange('reply', value);
  };

  const handleDnssecChange = (value: string) => {
    setSelectedDnssec(value);
    handleFilterChange('dnssec', value);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "GRAVITY":
      case "REGEX":
      case "DENYLIST":
        return <Badge variant="destructive">Blocked</Badge>;
      case "FORWARDED":
      case "CACHE":
        return <Badge variant="success">Allowed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleListAction = async (domain: string, action: 'allow' | 'deny') => {
    try {
      await addDomain(action, 'exact', {
        domain,
        comment: 'Added from Query Log',
      });
      toast.success(`Successfully added ${domain} to the ${action}list`);
      refresh(); // Refresh the query list
    } catch (error) {
      toast.error(`Failed to add ${domain} to the ${action}list: ${error}`);
    }
    setActionDomain(null);
  };

  const totalPages = Math.ceil(filteredRecords / entriesPerPage);
  const showingFrom = filteredRecords === 0 ? 0 : ((page - 1) * entriesPerPage) + 1;
  const showingTo = Math.min(page * entriesPerPage, filteredRecords);

  if (loading) {
    return <QueryLogsSkeleton />;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="space-y-4">
      <Collapsible
        open={isAdvancedOpen}
        onOpenChange={setIsAdvancedOpen}
        className="w-full"
      >
        <Card>
          <CardHeader>
            <CollapsibleTrigger className="flex w-full items-center justify-between">
              <CardTitle>Advanced filtering</CardTitle>
              {isAdvancedOpen ? <ChevronUp /> : <ChevronDown />}
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Time Range</Label>
                  <DatePickerWithRange
                    from={new Date(dateRange.from * 1000)}
                    to={new Date(dateRange.until * 1000)}
                    onChange={({ from, to }) => {
                      if (from && to) {
                        setDateRange({
                          from: Math.floor(from.getTime() / 1000),
                          until: Math.floor(to.getTime() / 1000)
                        });
                      }
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={diskMode}
                      onCheckedChange={(checked) => {
                        setDiskMode(checked);
                        if (checked) setLiveUpdate(false);
                      }}
                    />
                    <Label>
                      Query on-disk data (slower but shows older queries)
                    </Label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div>
                  <Label>Domain</Label>
                  <Select
                    value={selectedDomain}
                    onValueChange={handleDomainChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by domain" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Domains</SelectItem>
                      {domainSuggestions?.map(domain => (
                        <SelectItem key={domain} value={domain}>{domain}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Client IP</Label>
                  <Select
                    value={selectedClientIP}
                    onValueChange={handleClientIPChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by client IP" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All IPs</SelectItem>
                      {clientIPSuggestions?.map(ip => (
                        <SelectItem key={ip} value={ip}>{ip}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Client Name</Label>
                  <Select
                    value={selectedClientName}
                    onValueChange={handleClientNameChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by client name" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Names</SelectItem>
                      {clientNameSuggestions?.map(name => (
                        <SelectItem key={name} value={name}>{name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Upstream</Label>
                  <Select
                    value={selectedUpstream}
                    onValueChange={handleUpstreamChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by upstream" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Upstreams</SelectItem>
                      {upstreamSuggestions?.map(upstream => (
                        <SelectItem key={upstream} value={upstream}>{upstream}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Query Type</Label>
                  <Select value={selectedType} onValueChange={handleTypeChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      {filterOptions.types.map(type => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Status</Label>
                  <Select value={selectedStatus} onValueChange={handleStatusChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      {filterOptions.status.map(status => (
                        <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Reply</Label>
                  <Select
                    value={selectedReply}
                    onValueChange={handleReplyChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by reply" />
                    </SelectTrigger>
                    <SelectContent>
                      {filterOptions.reply.map(reply => (
                        <SelectItem key={reply.value} value={reply.value}>
                          {reply.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>DNSSEC</Label>
                  <Select
                    value={selectedDnssec}
                    onValueChange={handleDnssecChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by DNSSEC" />
                    </SelectTrigger>
                    <SelectContent>
                      {filterOptions.dnssec.map(dnssec => (
                        <SelectItem key={dnssec.value} value={dnssec.value}>{dnssec.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Select
                defaultValue="10"
                value={entriesPerPage?.toString() || "10"}
                onValueChange={(value) => {
                  setEntriesPerPage(Number(value));
                  setPage(1); // Reset to first page when changing entries per page
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue>
                    {`Show ${entriesPerPage} entries`}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 entries per page</SelectItem>
                  <SelectItem value="25">25 entries per page</SelectItem>
                  <SelectItem value="50">50 entries per page</SelectItem>
                  <SelectItem value="100">100 entries per page</SelectItem>
                  <SelectItem value="250">250 entries per page</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={liveUpdate}
                  onCheckedChange={setLiveUpdate}
                  disabled={diskMode}
                />
                <Label>Live update</Label>
              </div>
              <Button onClick={refresh} disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Refresh"
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Existing table code */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Response</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {queries.map((query) => (
                <TableRow key={`${query.time}-${query.domain}-${query.client.ip}`}>
                  <TableCell>
                    {format(query.time * 1000, "yyyy-MM-dd HH:mm:ss")}
                  </TableCell>
                  <TableCell className="font-mono">{query.domain}</TableCell>
                  <TableCell>{query.type}</TableCell>
                  <TableCell>
                    {query.client.name || query.client.ip}
                  </TableCell>
                  <TableCell>{getStatusBadge(query.status || "UNKNOWN")}</TableCell>
                  <TableCell className="space-x-2">
                    {query.reply.type === "UNKNOWN" ? (
                      <Ban className="h-4 w-4 text-red-500" />
                    ) : (
                      <Check className="h-4 w-4 text-green-500" />
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-green-500"
                      onClick={() => setActionDomain({ domain: query.domain, action: 'allow' })}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500"
                      onClick={() => setActionDomain({ domain: query.domain, action: 'deny' })}
                    >
                      <Ban className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
            <p className="text-sm text-muted-foreground order-2 sm:order-1">
              {filteredRecords > 0 ? (
                <>
                  Showing {showingFrom.toLocaleString()} to {showingTo.toLocaleString()} of {filteredRecords.toLocaleString()} entries
                  {filteredRecords !== totalRecords && (
                    <span className="whitespace-nowrap">
                      {` (filtered from ${totalRecords.toLocaleString()} total entries)`}
                    </span>
                  )}
                </>
              ) : (
                "No entries to show"
              )}
            </p>
            
            {totalPages > 1 && (
              <Pagination className="order-1 sm:order-2">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (page > 1) setPage(page - 1);
                      }}
                      aria-disabled={page === 1}
                      className={page === 1 ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                  
                  <PaginationNumbers
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                  />
                  
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (page < totalPages) setPage(page + 1);
                      }}
                      aria-disabled={page >= totalPages}
                      className={page >= totalPages ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>

          <p className="text-sm text-muted-foreground mt-4">
            Note: Queries for <code>pi.hole</code> and the hostname are never logged.
          </p>
        </CardContent>
      </Card>

      <AlertDialog open={actionDomain !== null} onOpenChange={() => setActionDomain(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Action</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to add <code>{actionDomain?.domain}</code> to the {actionDomain?.action}list?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (actionDomain) {
                  handleListAction(actionDomain.domain, actionDomain.action);
                }
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
