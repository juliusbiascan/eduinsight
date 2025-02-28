"use server"

import axios from "axios"
import { db } from "./db";


/**
 * Base URL for the API
 * @constant
 */
const API_BASE_URL = 'http://192.168.1.142'

const axiosInstance = axios.create({
    headers: {
        'User-Agent': 'EduInsight'
    }
});

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

export interface DatabaseSummaryResponse {
    sum_queries: number;
    sum_blocked: number;
    percent_blocked: number;
    total_clients: number;
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

/**
 * Check if authentication is required
 * The API may chose to reply with a valid session if no authentication is needed for this server.
 *
 * @constant
 */
export const validateSession = async (sidToken: string): Promise<Session> => {
    try {
        const response = await axiosInstance.get<ApiResponse>(`${API_BASE_URL}/api/auth?sid=${sidToken}`)
        return response.data.session;
    } catch (error: any) {
        throw new Error(`Authentication failed: ${error.message}`);
    }
}

/**
 * Submit password for login
 * Authenticate using a password. The password isn't stored in the session nor used to create the session token. Instead, the session token is produced using a cryptographically secure random number generator. A CSRF token is utilized to guard against CSRF attacks and is necessary when using Cookie-based authentication. However, it's not needed with other authentication methods.
 * Both the Session ID (SID) and CSRF token remain valid for the session's duration. The session can be extended before its expiration by performing any authenticated action. By default, the session lasts for 5 minutes. It can be invalidated by either logging out or deleting the session. Additionally, the session becomes invalid when the password is altered or a new application password is created.
 * If two-factor authentication (2FA) is activated, the Time-based One-Time Password (TOTP) token must be included in the request body. Be aware that the TOTP token, generated by your authenticator app, is only valid for 30 seconds. If the TOTP token is missing, invalid, or has been used previously, the login attempt will be unsuccessful.
 * @constant
 */
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

/**
 * Get activity graph data
 * Request data needed to generate the "Query over last 24 hours" graph. The sum of the values in the individual data arrays may be smaller than the total number of queries for the corresponding timestamp. The remaining queries are queries that do not fit into the shown categories (e.g. database busy, unknown status queries, etc.).
 * @constant 
 */
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

/**
 * Get per-client activity graph data
 * Request data needed to generate the "Client activity over last 24 hours" graph. This endpoint returns the top N clients, sorted by total number of queries within 24 hours. If N is set to 0, all clients will be returned. The client name is only available if the client's IP address can be resolved to a hostname.
 * 
 * The last client returned is a special client that contains the total number of queries that were not sent by any of the other shown clients , i.e. queries that were sent by clients that are not in the top N. This client is always present, even if it has 0 queries and can be identified by the special name "other clients" (mind the space in the hostname) and the IP address "0.0.0.0".
 * 
 * Note that, due to privacy settings, the returned data may also be empty.
 * @param n - Maximum number of clients to return, setting this to 0 will return all clients
 */
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

/**
 * Get database summary statistics
 * @param from - Unix timestamp (in seconds) for start of period. Defaults to 24 hours ago
 * @param until - Unix timestamp (in seconds) for end of period. Defaults to current time
 */
export const getDatabaseSummary = async (
    from: number = Math.floor(Date.now() / 1000) - 86400,
    until: number = Math.floor(Date.now() / 1000)
): Promise<DatabaseSummaryResponse> => {
    try {
        const sessionManager = SessionManager.getInstance();
        const session = await sessionManager.getValidSession();

        if (!session.valid) {
            throw new Error('Invalid session');
        }

        const response = await axiosInstance.get<DatabaseSummaryResponse>(
            `${API_BASE_URL}/api/stats/database/summary?from=${from}&until=${until}&sid=${session.sid}`
        );
        return response.data;
    } catch (error: any) {
        throw new Error(`Database summary failed: ${error.message}`);
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