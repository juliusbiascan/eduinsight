"use server"

import axios from "axios"
import { db } from "./db";

/**
 * Base URL for the API
 */
const API_BASE_URL = 'https://pi.eduinsight.systems'

const axiosInstance = axios.create({
    headers: {
        'User-Agent': 'EduInsight'
    }
});

// =========================================
// Authentication & Session Types
// =========================================
export interface Session {
    valid: boolean;
    totp: boolean;
    sid: string | null;
    csrf: string | null;
    validity: number;
    message: string | null;
}

export interface ApiResponse {
    session: Session;
    took: number;
}

class SessionManager {
    private static instance: SessionManager;
    private currentSession: Session | null = null;

    private constructor() {}

    private async saveToDatabase(session: Session) {
        await db.piHoleSession.upsert({
            where: { sid: session.sid! },
            create: {
                sid: session.sid!,
                csrf: session.csrf,
                valid: session.valid,
                totp: session.totp,
                validity: session.validity,
                message: session.message
            },
            update: {
                csrf: session.csrf,
                valid: session.valid,
                totp: session.totp,
                validity: session.validity,
                message: session.message,
                updatedAt: new Date()
            }
        });
    }

    private async loadFromDatabase(): Promise<Session | null> {
        const storedSession = await db.piHoleSession.findFirst({
            orderBy: { updatedAt: 'desc' }
        });

        if (storedSession) {
            return {
                sid: storedSession.sid,
                csrf: storedSession.csrf,
                valid: storedSession.valid,
                totp: storedSession.totp,
                validity: storedSession.validity,
                message: storedSession.message
            };
        }
        return null;
    }

    public static getInstance(): SessionManager {
        if (!SessionManager.instance) {
            SessionManager.instance = new SessionManager();
        }
        return SessionManager.instance;
    }

    public async getValidSession(): Promise<Session> {
        if (!this.currentSession) {
            this.currentSession = await this.loadFromDatabase();
        }

        if (this.currentSession?.sid) {
            try {
                const validatedSession = await validateSession(this.currentSession.sid);
                if (validatedSession.valid) {
                    this.currentSession = validatedSession;
                    await this.saveToDatabase(validatedSession);
                    return validatedSession;
                }
            } catch (error) {
                console.warn('Session validation failed, getting new session');
            }
        }

        const newSession = await getSession();
        if (!newSession.valid) {
            throw new Error('Failed to obtain valid session');
        }

        this.currentSession = newSession;
        await this.saveToDatabase(newSession);
        return newSession;
    }

    public async clearSession() {
        this.currentSession = null;
        await db.piHoleSession.deleteMany();
    }
}

export const validateSession = async (sidToken: string): Promise<Session> => {
    try {
        const response = await axiosInstance.get<ApiResponse>(`${API_BASE_URL}/api/auth?sid=${sidToken}`)
        return response.data.session;
    } catch (error: any) {
        throw new Error(`Authentication failed: ${error.message}`);
    }
}

export const getSession = async (): Promise<Session> => {
    try {
        const response = await axiosInstance.post<ApiResponse>(`${API_BASE_URL}/api/auth`, {
            password: process.env.PIHOLE_PASSWORD
        })
        return response.data.session;
    } catch (error: any) {
        throw new Error(`Session creation failed: ${error.message}`);
    }
}

// =========================================
// Client Management
// =========================================
export interface ClientData {
    client: string;
    comment: string | null;
    groups: number[];
    id: number;
    date_added: number;
    date_modified: number;
    name: string | null;
}

export interface ClientsResponse {
    clients: ClientData[];
    took: number;
}

export interface ClientSuggestion {
    hwaddr: string | null;
    macVendor: string | null;
    lastQuery: number;
    addresses: string | null;
    names: string | null;
}

export interface ClientSuggestionsResponse {
    clients: ClientSuggestion[];
    took: number;
}

export interface CreateClientRequest {
    client: string | string[];
    comment?: string | null;
    groups: number[];
}

export interface CreateClientResponse {
    clients: ClientData[];
    processed: {
        success: Array<{ item: string }>;
        errors: Array<{ item: string; error: string }>;
    } | null;
    took: number;
}

export interface UpdateClientRequest {
    comment?: string | null;
    groups?: number[];
}

export interface UpdateClientResponse {
    clients: ClientData[];
    processed: {
        success: Array<{ item: string }>;
        errors: Array<{ item: string; error: string }>;
    } | null;
    took: number;
}

export interface DeleteClientBatchRequest {
    item: string;
}

// Client API Functions
export const getClients = async (clientIdentifier?: string): Promise<ClientsResponse> => {
    try {
        const sessionManager = SessionManager.getInstance();
        const session = await sessionManager.getValidSession();

        if (!session.valid) {
            throw new Error('Invalid session');
        }

        const url = clientIdentifier
            ? `${API_BASE_URL}/api/clients/${encodeURIComponent(clientIdentifier)}?sid=${session.sid}`
            : `${API_BASE_URL}/api/clients?sid=${session.sid}`;

        const response = await axiosInstance.get<ClientsResponse>(url);
        return response.data;
    } catch (error: any) {
        throw new Error(`Get clients failed: ${error.message}`);
    }
}

export const getClientSuggestions = async (): Promise<ClientSuggestionsResponse> => {
    try {
        const sessionManager = SessionManager.getInstance();
        const session = await sessionManager.getValidSession();

        if (!session.valid) {
            throw new Error('Invalid session');
        }

        const response = await axiosInstance.get<ClientSuggestionsResponse>(
            `${API_BASE_URL}/api/clients/_suggestions?sid=${session.sid}`
        );
        return response.data;
    } catch (error: any) {
        throw new Error(`Get client suggestions failed: ${error.message}`);
    }
}

export const createClient = async (data: CreateClientRequest): Promise<CreateClientResponse> => {
    try {
        const sessionManager = SessionManager.getInstance();
        const session = await sessionManager.getValidSession();

        if (!session.valid) {
            throw new Error('Invalid session');
        }

        const response = await axiosInstance.post<CreateClientResponse>(
            `${API_BASE_URL}/api/clients?sid=${session.sid}`,
            data
        );
        return response.data;
    } catch (error: any) {
        if (error.response?.data?.error) {
            throw new Error(error.response.data.error);
        }
        throw new Error(`Create client failed: ${error.message}`);
    }
}

export const updateClient = async (
    clientIdentifier: string,
    data: UpdateClientRequest
): Promise<UpdateClientResponse> => {
    try {
        const sessionManager = SessionManager.getInstance();
        const session = await sessionManager.getValidSession();

        if (!session.valid) {
            throw new Error('Invalid session');
        }

        const response = await axiosInstance.put<UpdateClientResponse>(
            `${API_BASE_URL}/api/clients/${encodeURIComponent(clientIdentifier)}?sid=${session.sid}`,
            data
        );
        return response.data;
    } catch (error: any) {
        throw new Error(`Update client failed: ${error.message}`);
    }
}

export const deleteClient = async (clientIdentifier: string): Promise<void> => {
    try {
        const sessionManager = SessionManager.getInstance();
        const session = await sessionManager.getValidSession();

        if (!session.valid) {
            throw new Error('Invalid session');
        }

        const response = await axiosInstance.delete(
            `${API_BASE_URL}/api/clients/${encodeURIComponent(clientIdentifier)}?sid=${session.sid}`
        );

        if (response.status !== 204) {
            throw new Error('Failed to delete client');
        }
    } catch (error: any) {
        throw new Error(`Delete client failed: ${error.message}`);
    }
}

export const deleteClients = async (clients: DeleteClientBatchRequest[]): Promise<void> => {
    try {
        const sessionManager = SessionManager.getInstance();
        const session = await sessionManager.getValidSession();

        if (!session.valid) {
            throw new Error('Invalid session');
        }

        const response = await axiosInstance.post(
            `${API_BASE_URL}/api/clients:batchDelete?sid=${session.sid}`,
            clients
        );

        if (response.status !== 204) {
            throw new Error('Failed to delete clients');
        }
    } catch (error: any) {
        throw new Error(`Delete clients failed: ${error.message}`);
    }
};

// =========================================
// Group Management
// =========================================
export interface Group {
    name: string;
    comment: string | null;
    enabled: boolean;
    id: number;
    date_added: number;
    date_modified: number;
}

export interface GroupResponse {
    groups: Group[];
    took: number;
}

export interface CreateGroupRequest {
    name: string | string[];
    comment?: string | null;
    enabled?: boolean;
}

export interface GroupSuccess {
    item: string;
}

export interface GroupError {
    item: string;
    error: string;
}

export interface GroupProcessed {
    success: GroupSuccess[];
    errors: GroupError[];
}

export interface CreateGroupResponse {
    groups: Group[];
    processed: GroupProcessed | null;
    took: number;
}

export interface DeleteGroupItem {
    item: string;
}

export interface UpdateGroupRequest {
    name: string;
    comment?: string | null;
    enabled?: boolean;
}

export interface UpdateGroupResponse {
    groups: Group[];
    processed: GroupProcessed | null;
    took: number;
}

// Group API Functions
export const getGroups = async (name?: string): Promise<GroupResponse> => {
    try {
        const sessionManager = SessionManager.getInstance();
        const session = await sessionManager.getValidSession();

        if (!session.valid) {
            throw new Error('Invalid session');
        }

        const url = name
            ? `${API_BASE_URL}/api/groups/${encodeURIComponent(name)}?sid=${session.sid}`
            : `${API_BASE_URL}/api/groups?sid=${session.sid}`;

        const response = await axiosInstance.get<GroupResponse>(url);
        return response.data;
    } catch (error: any) {
        throw new Error(`Get groups failed: ${error.message}`);
    }
}

export const createGroup = async (data: CreateGroupRequest): Promise<CreateGroupResponse> => {
    try {
        const sessionManager = SessionManager.getInstance();
        const session = await sessionManager.getValidSession();

        if (!session.valid) {
            throw new Error('Invalid session');
        }

        const response = await axiosInstance.post<CreateGroupResponse>(
            `${API_BASE_URL}/api/groups?sid=${session.sid}`,
            data
        );
        return response.data;
    } catch (error: any) {
        if (error.response?.data?.error) {
            throw new Error(error.response.data.error);
        }
        throw new Error(`Create group failed: ${error.message}`);
    }
}

export const batchDeleteGroups = async (groups: DeleteGroupItem[]): Promise<void> => {
    try {
        const sessionManager = SessionManager.getInstance();
        const session = await sessionManager.getValidSession();

        if (!session.valid) {
            throw new Error('Invalid session');
        }

        const response = await axiosInstance.post(
            `${API_BASE_URL}/api/groups:batchDelete?sid=${session.sid}`,
            groups
        );

        if (response.status !== 204) {
            throw new Error('Failed to delete groups');
        }
    } catch (error: any) {
        throw new Error(`Batch delete groups failed: ${error.message}`);
    }
}

export const deleteGroup = async (name: string): Promise<void> => {
    try {
        const sessionManager = SessionManager.getInstance();
        const session = await sessionManager.getValidSession();

        if (!session.valid) {
            throw new Error('Invalid session');
        }

        const response = await axiosInstance.delete(
            `${API_BASE_URL}/api/groups/${encodeURIComponent(name)}?sid=${session.sid}`
        );

        if (response.status !== 204) {
            throw new Error('Failed to delete group');
        }
    } catch (error: any) {
        throw new Error(`Delete group failed: ${error.message}`);
    }
}

export const updateGroup = async (
    currentName: string,
    data: UpdateGroupRequest
): Promise<UpdateGroupResponse> => {
    try {
        const sessionManager = SessionManager.getInstance();
        const session = await sessionManager.getValidSession();

        if (!session.valid) {
            throw new Error('Invalid session');
        }

        const response = await axiosInstance.put<UpdateGroupResponse>(
            `${API_BASE_URL}/api/groups/${encodeURIComponent(currentName)}?sid=${session.sid}`,
            data
        );
        return response.data;
    } catch (error: any) {
        if (error.response?.data?.error) {
            throw new Error(error.response.data.error);
        }
        throw new Error(`Update group failed: ${error.message}`);
    }
}

// =========================================
// Domain Management
// =========================================
export interface DomainEntry {
    domain: string;
    unicode: string;
    type: 'allow' | 'deny';
    kind: 'exact' | 'regex';
    comment: string | null;
    groups: number[];
    enabled: boolean;
    id: number;
    date_added: number;
    date_modified: number;
}

export interface DomainResponse {
    domains: DomainEntry[];
    took: number;
}

export interface DomainAddRequest {
    domain: string | string[];
    comment?: string | null;
    groups?: number[];
    enabled?: boolean;
}

export interface DomainSuccess {
    item: string;
}

export interface DomainError {
    item: string;
    error: string;
}

export interface DomainProcessed {
    success: DomainSuccess[];
    errors: DomainError[];
}

export interface AddDomainResponse {
    domains: DomainEntry[];
    processed: DomainProcessed | null;
    took: number;
}

export interface DomainDeleteItem {
    item: string;
    type: 'allow' | 'deny';
    kind: 'exact' | 'regex';
}

export interface AllDomainsResponse {
    domains: DomainEntry[];
    took: number;
}

export interface UpdateDomainRequest {
    type: 'allow' | 'deny';
    kind: 'exact' | 'regex';
    comment?: string | null;
    groups: number[];
    enabled: boolean;
}

export interface UpdateDomainResponse {
    domains: DomainEntry[];
    processed: GroupProcessed | null;
    took: number;
}

// Domain API Functions
export const getDomain = async (
    type: 'allow' | 'deny',
    kind: 'exact' | 'regex',
    domain: string
): Promise<DomainResponse> => {
    try {
        const sessionManager = SessionManager.getInstance();
        const session = await sessionManager.getValidSession();

        if (!session.valid) {
            throw new Error('Invalid session');
        }

        const response = await axiosInstance.get<DomainResponse>(
            `${API_BASE_URL}/api/domains/${type}/${kind}/${encodeURIComponent(domain)}?sid=${session.sid}`
        );
        return response.data;
    } catch (error: any) {
        throw new Error(`Domain lookup failed: ${error.message}`);
    }
}

export const addDomain = async (
    type: 'allow' | 'deny',
    kind: 'exact' | 'regex',
    data: DomainAddRequest
): Promise<AddDomainResponse> => {
    try {
        const sessionManager = SessionManager.getInstance();
        const session = await sessionManager.getValidSession();

        if (!session.valid) {
            throw new Error('Invalid session');
        }

        const response = await axiosInstance.post<AddDomainResponse>(
            `${API_BASE_URL}/api/domains/${type}/${kind}?sid=${session.sid}`,
            data
        );
        return response.data;
    } catch (error: any) {
        throw new Error(`Add domain failed: ${error.message}`);
    }
}

export const batchDeleteDomains = async (domains: DomainDeleteItem[]) => {
    try {
        const sessionManager = SessionManager.getInstance();
        const session = await sessionManager.getValidSession();

        if (!session.valid) {
            throw new Error('Invalid session');
        }

        const response = await axiosInstance.post(
            `${API_BASE_URL}/api/domains:batchDelete?sid=${session.sid}`,
            domains
        );
        return response.status;
    } catch (error: any) {
        throw new Error(`Batch delete failed: ${error.message}`);
    }
}

export const getAllDomains = async (): Promise<AllDomainsResponse> => {
    try {
        const sessionManager = SessionManager.getInstance();
        const session = await sessionManager.getValidSession();

        if (!session.valid) {
            throw new Error('Invalid session');
        }

        const response = await axiosInstance.get<AllDomainsResponse>(
            `${API_BASE_URL}/api/domains?sid=${session.sid}`
        );

        if (!response.data) {
            throw new Error('No data received from the API');
        }

        if (!response.data.domains) {
            throw new Error('Invalid response format: missing domains property');
        }

        return {
            domains: response.data.domains,
            took: response.data.took || 0
        };
    } catch (error: any) {
        if (error.response) {
            throw new Error(`API error: ${error.response.status} - ${error.response.statusText}`);
        }
        throw new Error(`Failed to fetch domains: ${error.message}`);
    }
}

export const updateDomain = async (
    type: 'allow' | 'deny',
    kind: 'exact' | 'regex',
    domain: string,
    data: UpdateDomainRequest
): Promise<UpdateDomainResponse> => {
    try {
        const sessionManager = SessionManager.getInstance();
        const session = await sessionManager.getValidSession();

        if (!session.valid) {
            throw new Error('Invalid session');
        }

        const response = await axiosInstance.put<UpdateDomainResponse>(
            `${API_BASE_URL}/api/domains/${type}/${kind}/${encodeURIComponent(domain)}?sid=${session.sid}`,
            data
        );
        return response.data;
    } catch (error: any) {
        if (error.response?.data?.error) {
            throw new Error(error.response.data.error);
        }
        throw new Error(`Update domain failed: ${error.message}`);
    }
}

// =========================================
// Statistics & History
// =========================================
export interface HistoryEntry {
    timestamp: number;
    total: number;
    cached: number;
    blocked: number;
    forwarded: number;
}

export interface HistoryResponse {
    history: HistoryEntry[];
    took: number;
}

export interface SummaryResponse {
    queries: {
        total: number;
        blocked: number;
        percent_blocked: number;
        unique_domains: number;
        forwarded: number;
        cached: number;
        frequency: number;
        types: {
            A: number;
            AAAA: number;
            ANY: number;
            SRV: number;
            SOA: number;
            PTR: number;
            TXT: number;
            NAPTR: number;
            MX: number;
            DS: number;
            RRSIG: number;
            DNSKEY: number;
            NS: number;
            SVCB: number;
            HTTPS: number;
            OTHER: number;
        };
        status: {
            UNKNOWN: number;
            GRAVITY: number;
            FORWARDED: number;
            CACHE: number;
            REGEX: number;
            DENYLIST: number;
            EXTERNAL_BLOCKED_IP: number;
            EXTERNAL_BLOCKED_NULL: number;
            EXTERNAL_BLOCKED_NXRA: number;
            GRAVITY_CNAME: number;
            REGEX_CNAME: number;
            DENYLIST_CNAME: number;
            RETRIED: number;
            RETRIED_DNSSEC: number;
            IN_PROGRESS: number;
            DBBUSY: number;
            SPECIAL_DOMAIN: number;
            CACHE_STALE: number;
            EXTERNAL_BLOCKED_EDE15: number;
        };
        replies: {
            UNKNOWN: number;
            NODATA: number;
            NXDOMAIN: number;
            CNAME: number;
            IP: number;
            DOMAIN: number;
            RRNAME: number;
            SERVFAIL: number;
            REFUSED: number;
            NOTIMP: number;
            OTHER: number;
            DNSSEC: number;
            NONE: number;
            BLOB: number;
        };
    };
    clients: {
        active: number;
        total: number;
    };
    gravity: {
        domains_being_blocked: number;
        last_update: number;
    };
    took: number;
}

export interface QueryTypesResponse {
    types: {
        A: number;
        AAAA: number;
        ANY: number;
        SRV: number;
        SOA: number;
        PTR: number;
        TXT: number;
        NAPTR: number;
        MX: number;
        DS: number;
        RRSIG: number;
        DNSKEY: number;
        NS: number;
        SVCB: number;
        HTTPS: number;
        OTHER: number;
    };
    took: number;
}

export interface ClientInfo {
    name: string | null;
    total: number;
}

export interface ClientHistoryEntry {
    timestamp: number;
    data: {
        [clientId: string]: number;
    };
}

export interface ClientHistoryResponse {
    clients: {
        [clientId: string]: ClientInfo;
    };
    history: ClientHistoryEntry[];
    took: number;
}

export interface UpstreamStatistics {
    response: number;
    variance: number;
}

export interface UpstreamServer {
    ip: string | null;
    name: string | null;
    port: number;
    count: number;
    statistics: UpstreamStatistics;
}

export interface UpstreamServersResponse {
    upstreams: UpstreamServer[];
    forwarded_queries: number;
    total_queries: number;
    took: number;
}

export interface TopDomain {
    domain: string;
    count: number;
}

export interface TopDomainsResponse {
    domains: TopDomain[];
    total_queries: number;
    blocked_queries: number;
    took: number;
}

export interface TopClient {
    ip: string;
    name: string | null;
    count: number;
}

export interface TopClientsResponse {
    clients: TopClient[];
    total_queries: number;
    blocked_queries: number;
    took: number;
}

export interface QueryReply {
    type: string | null;
    time: number;
}

export interface QueryClient {
    ip: string;
    name: string | null;
}

export interface QueryEde {
    code: number;
    text: string | null;
}

export interface Query {
    id: number;
    time: number;
    type: string;
    domain: string;
    cname: string | null;
    status: string | null;
    client: QueryClient;
    dnssec: string | null;
    reply: QueryReply;
    list_id: number | null;
    upstream: string | null;
    ede: QueryEde;
}

export interface QueriesResponse {
    queries: Query[];
    cursor: number;
    recordsTotal: number;
    recordsFiltered: number;
    draw: number;
    took: number;
}

interface QueryParams {
    from?: number;
    until?: number;
    length?: number;
    start?: number;
    cursor?: number;
    domain?: string;
    client_ip?: string;
    client_name?: string;
    upstream?: string;
    type?: string;
    status?: string;
    reply?: string;
    dnssec?: string;
}

// Statistics API Functions
export const getHistory = async (): Promise<HistoryEntry[]> => {
    try {
        const sessionManager = SessionManager.getInstance();
        const session = await sessionManager.getValidSession();

        if (!session.valid) {
            throw new Error('Invalid session');
        }

        const response = await axiosInstance.get<HistoryResponse>(`${API_BASE_URL}/api/history?sid=${session.sid}`);
        return response.data.history;
    } catch (error: any) {
        throw new Error(`History failed: ${error.message}`);
    }
}

export const getClientHistory = async (n: number = 0): Promise<ClientHistoryResponse> => {
    try {
        const sessionManager = SessionManager.getInstance();
        const session = await sessionManager.getValidSession();

        if (!session.valid) {
            throw new Error('Invalid session');
        }

        const response = await axiosInstance.get<ClientHistoryResponse>(
            `${API_BASE_URL}/api/history/clients?N=${n}&sid=${session.sid}`
        );
        return response.data;
    } catch (error: any) {
        throw new Error(`Client history failed: ${error.message}`);
    }
}

export const getSummary = async (): Promise<SummaryResponse> => {
    try {
        const sessionManager = SessionManager.getInstance();
        const session = await sessionManager.getValidSession();

        if (!session.valid) {
            throw new Error('Invalid session');
        }

        const response = await axiosInstance.get<SummaryResponse>(
            `${API_BASE_URL}/api/stats/summary?sid=${session.sid}`
        );
        return response.data;
    } catch (error: any) {
        throw new Error(`Summary request failed: ${error.message}`);
    }
}

export const getQueryTypes = async (): Promise<QueryTypesResponse> => {
    try {
        const sessionManager = SessionManager.getInstance();
        const session = await sessionManager.getValidSession();

        if (!session.valid) {
            throw new Error('Invalid session');
        }

        const response = await axiosInstance.get<QueryTypesResponse>(`${API_BASE_URL}/api/stats/query_types?sid=${session.sid}`);
        return response.data;
    } catch (error: any) {
        throw new Error(`Query types failed: ${error.message}`);
    }
}

export const getUpstreamServers = async (): Promise<UpstreamServersResponse> => {
    try {
        const sessionManager = SessionManager.getInstance();
        const session = await sessionManager.getValidSession();

        if (!session.valid) {
            throw new Error('Invalid session');
        }

        const response = await axiosInstance.get<UpstreamServersResponse>(
            `${API_BASE_URL}/api/stats/upstreams?sid=${session.sid}`
        );
        return response.data;
    } catch (error: any) {
        throw new Error(`Upstream servers failed: ${error.message}`);
    }
}

export const getTopDomains = async (count: number = 10, blocked: boolean = false): Promise<TopDomainsResponse> => {
    try {
        const sessionManager = SessionManager.getInstance();
        const session = await sessionManager.getValidSession();

        if (!session.valid) {
            throw new Error('Invalid session');
        }

        const response = await axiosInstance.get<TopDomainsResponse>(
            `${API_BASE_URL}/api/stats/top_domains?count=${count}&blocked=${blocked}&sid=${session.sid}`
        );
        return response.data;
    } catch (error: any) {
        throw new Error(`Top domains failed: ${error.message}`);
    }
}

export const getTopClients = async (count: number = 10, blocked: boolean = false): Promise<TopClientsResponse> => {
    try {
        const sessionManager = SessionManager.getInstance();
        const session = await sessionManager.getValidSession();

        if (!session.valid) {
            throw new Error('Invalid session');
        }

        const response = await axiosInstance.get<TopClientsResponse>(
            `${API_BASE_URL}/api/stats/top_clients?count=${count}&blocked=${blocked}&sid=${session.sid}`
        );
        return response.data;
    } catch (error: any) {
        throw new Error(`Top clients failed: ${error.message}`);
    }
}

export const getQueries = async (params: QueryParams = {}): Promise<QueriesResponse> => {
    try {
        const sessionManager = SessionManager.getInstance();
        const session = await sessionManager.getValidSession();

        if (!session.valid) {
            throw new Error('Invalid session');
        }

        const queryParams = new URLSearchParams();
        queryParams.append('sid', session.sid!);
        
        // Add all optional parameters to the query string
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
                queryParams.append(key, value.toString());
            }
        });

        const response = await axiosInstance.get<QueriesResponse>(
            `${API_BASE_URL}/api/queries?${queryParams.toString()}`
        );
        return response.data;
    } catch (error: any) {
        throw new Error(`Queries request failed: ${error.message}`);
    }
}

// =========================================
// List Management
// =========================================
export interface List {
    address: string;
    type: 'allow' | 'block';
    comment: string | null;
    groups: number[];
    enabled: boolean;
    id: number;
    date_added: number;
    date_modified: number;
    date_updated: number;
    number: number;
    invalid_domains: number;
    abp_entries: number;
    status: number;
}

export interface ListResponse {
    lists: List[];
    took: number;
}

export interface AddListRequest {
    address: string | string[];
    type: 'allow' | 'block';
    comment?: string | null;
    groups?: number[];
    enabled?: boolean;
}

export interface AddListResponse {
    lists: List[];
    processed: {
        success: Array<{ item: string }>;
        errors: Array<{ item: string; error: string }>;
    } | null;
    took: number;
}

export interface UpdateListRequest {
    comment?: string | null;
    type: 'allow' | 'block';
    groups: number[];
    enabled: boolean;
}

export interface UpdateListResponse {
    lists: List[];
    processed: {
        success: Array<{ item: string }>;
        errors: Array<{ item: string; error: string }>;
    } | null;
    took: number;
}

// Add new function for updating lists
export const updateList = async (
    address: string,
    type: 'allow' | 'block',
    data: UpdateListRequest
): Promise<UpdateListResponse> => {
    try {
        const sessionManager = SessionManager.getInstance();
        const session = await sessionManager.getValidSession();

        if (!session.valid) {
            throw new Error('Invalid session');
        }

        const response = await axiosInstance.put<UpdateListResponse>(
            `${API_BASE_URL}/api/lists/${encodeURIComponent(address)}?type=${type}&sid=${session.sid}`,
            data
        );
        return response.data;
    } catch (error: any) {
        if (error.response?.data?.error) {
            throw new Error(error.response.data.error);
        }
        throw new Error(`Update list failed: ${error.message}`);
    }
}

export const getLists = async (): Promise<ListResponse> => {
    try {
        const sessionManager = SessionManager.getInstance();
        const session = await sessionManager.getValidSession();

        if (!session.valid) {
            throw new Error('Invalid session');
        }

        const response = await axiosInstance.get<ListResponse>(
            `${API_BASE_URL}/api/lists?sid=${session.sid}`
        );
        return response.data;
    } catch (error: any) {
        throw new Error(`Get lists failed: ${error.message}`);
    }
}

export const addList = async (data: AddListRequest): Promise<AddListResponse> => {
    try {
        const sessionManager = SessionManager.getInstance();
        const session = await sessionManager.getValidSession();

        if (!session.valid) {
            throw new Error('Invalid session');
        }

        const response = await axiosInstance.post<AddListResponse>(
            `${API_BASE_URL}/api/lists?sid=${session.sid}`,
            data
        );
        return response.data;
    } catch (error: any) {
        throw new Error(`Add list failed: ${error.message}`);
    }
}

export const deleteList = async (address: string, type: 'allow' | 'block'): Promise<void> => {
    try {
        const sessionManager = SessionManager.getInstance();
        const session = await sessionManager.getValidSession();

        if (!session.valid) {
            throw new Error('Invalid session');
        }

        const encodedAddress = encodeURIComponent(address);
        const response = await axiosInstance.delete(
            `${API_BASE_URL}/api/lists/${encodedAddress}?type=${type}&sid=${session.sid}`
        );

        if (response.status !== 204) {
            throw new Error('Failed to delete list');
        }
    } catch (error: any) {
        throw new Error(`Delete list failed: ${error.message}`);
    }
}
