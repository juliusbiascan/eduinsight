import { useEffect, useState } from "react";
import { getQueries, getQuerySuggestions, type Query, type QuerySuggestions } from "@/lib/pihole";

interface QueryFilters {
  domain?: string;
  client_ip?: string;
  client_name?: string;
  upstream?: string;
  type?: string;
  status?: string;
  reply?: string;
  dnssec?: string;
}

interface UseQueryLogsOptions {
  entriesPerPage?: number;
  liveUpdate?: boolean;
  diskMode?: boolean;
}

interface QueryLogsState {
  queries: Query[];
  loading: boolean;
  error: string | null;
  totalRecords: number;
  filteredRecords: number;
  suggestions: QuerySuggestions;
  dateRange: {
    from: number;
    until: number;
  };
}

export function useQueryLogs(interval: number = 5000, options: UseQueryLogsOptions = {}) {
  const [state, setState] = useState<QueryLogsState>({
    queries: [],
    loading: true,
    error: null,
    totalRecords: 0,
    filteredRecords: 0,
    suggestions: {
      domain: [],
      client_ip: [],
      client_name: [],
      upstream: [],
      type: [],
      status: [],
      reply: [],
      dnssec: []
    },
    dateRange: {
      from: Math.floor((Date.now() - 24 * 60 * 60 * 1000) / 1000), // 24 hours ago
      until: Math.floor(Date.now() / 1000)
    }
  });

  const [filters, setFilters] = useState<QueryFilters>({});
  const [page, setPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(options.entriesPerPage || 10);
  const [liveUpdate, setLiveUpdate] = useState(options.liveUpdate || false);
  const [diskMode, setDiskMode] = useState(options.diskMode || false);

  const fetchQueries = async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      const [queriesResponse, suggestionsResponse] = await Promise.all([
        getQueries({
          from: state.dateRange.from,
          until: state.dateRange.until,
          length: entriesPerPage,
          start: (page - 1) * entriesPerPage,
          disk: diskMode,
          ...filters
        }),
        getQuerySuggestions()
      ]);

      setState(prev => ({
        ...prev,
        queries: queriesResponse.queries,
        totalRecords: queriesResponse.recordsTotal,
        filteredRecords: queriesResponse.recordsFiltered,
        suggestions: suggestionsResponse.suggestions,
        loading: false,
        error: null
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch queries'
      }));
    }
  };

  useEffect(() => {
    let mounted = true;
    const doFetch = async () => {
      if (mounted) {
        await fetchQueries();
      }
    };
    doFetch();
    return () => {
      mounted = false;
    };
  }, [page, entriesPerPage, filters, diskMode, state.dateRange]);

  useEffect(() => {
    if (!liveUpdate || diskMode) return;
    const timer = setInterval(fetchQueries, interval);
    return () => clearInterval(timer);
  }, [liveUpdate, diskMode, interval]);

  const refresh = () => {
    setState(prev => ({ ...prev, loading: true }));
    fetchQueries();
  };

  const setDateRange = (range: { from: number; until: number }) => {
    setState(prev => ({
      ...prev,
      dateRange: range,
      loading: true
    }));
  };

  return {
    ...state,
    setFilters,
    refresh,
    diskMode,
    setDiskMode,
    liveUpdate,
    setLiveUpdate,
    dateRange: state.dateRange,
    setDateRange,
    page,
    setPage,
    entriesPerPage,
    setEntriesPerPage
  };
}
