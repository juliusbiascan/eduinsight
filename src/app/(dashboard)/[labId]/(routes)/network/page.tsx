import { getDatabaseSummary, getHistory, getClientHistory, getQueryTypes, getUpstreamServers, getTopDomains, getTopClients } from "@/lib/pihole";
import { NetworkGraph } from "@/components/ui/network-graph";
import PageContainer from "@/components/layout/page-container";
import { Separator } from "@/components/ui/separator";
import { Suspense } from "react";
import { Heading } from "@/components/ui/heading";
import { NetworkGraphSkeleton } from "@/components/ui/network-graph-skeleton";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ClientActivityGraph } from "@/components/ui/client-activity-graph";
import { ClientActivitySkeleton } from "@/components/ui/client-activity-skeleton";
import { QueryTypesPie } from "@/components/ui/query-types-pie";
import { QueryTypesSkeleton } from "@/components/ui/query-types-skeleton";
import { UpstreamServersPie } from "@/components/ui/upstream-servers-pie";
import { DomainsTable } from "@/components/domains/domains-table";
import { ClientsTable } from "@/components/clients/clients-table";

const NetworkPage = async () => {
  const summary = await getDatabaseSummary();
  const history = await getHistory();
  const clientHistory = await getClientHistory(0);
  const queryTypes = await getQueryTypes();
  const upstreamServers = await getUpstreamServers();
  const [permitted, blocked, topClients, topBlockedClients] = await Promise.all([
    getTopDomains(10, false),
    getTopDomains(10, true),
    getTopClients(10, false),
    getTopClients(10, true)
  ]);
  const formattedData = history.map(entry => ({
    ...entry,
    timestamp: new Date(entry.timestamp * 1000).toISOString()
  }));

  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col space-y-2'>
        <div className='flex items-start justify-between'>
          <Heading
            title='Network'
            description='Network activity and statistics'
            className="py-2"
          />
        </div>
        <Separator className="my-1" />

        <div className='grid gap-2 grid-cols-2 lg:grid-cols-4'>
          <Card className="overflow-hidden">
            <CardHeader className='flex flex-row items-center justify-between space-y-0 p-3'>
              <CardTitle className='text-xs font-medium'>
                Total Queries
              </CardTitle>
              <div className="p-1.5 bg-emerald-100 rounded-full">
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='#10b981'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  className='h-4 w-4'
                >
                  <path d='M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' />
                </svg>
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className='text-lg font-bold'>{summary.sum_queries.toLocaleString()}</div>
              <p className="text-[10px] text-muted-foreground">Total DNS queries in last 24h</p>
            </CardContent>
          </Card>
          <Card className="overflow-hidden">
            <CardHeader className='flex flex-row items-center justify-between space-y-0 p-3'>
              <CardTitle className='text-xs font-medium'>
                Queries Blocked
              </CardTitle>
              <div className="p-1.5 bg-red-100 rounded-full">
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='#dc2626'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  className='h-4 w-4'
                >
                  <path d='M18.36 6.64a9 9 0 1 1-12.73 0'></path>
                  <line x1='12' y1='2' x2='12' y2='12'></line>
                </svg>
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className='text-lg font-bold'>{summary.sum_blocked.toLocaleString()}</div>
              <p className="text-[10px] text-muted-foreground">Blocked DNS queries in last 24h</p>
            </CardContent>
          </Card>
          <Card className="overflow-hidden">
            <CardHeader className='flex flex-row items-center justify-between space-y-0 p-3'>
              <CardTitle className='text-xs font-medium'>Percentage Blocked</CardTitle>
              <div className="p-1.5 bg-blue-100 rounded-full">
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='#2563eb'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  className='h-4 w-4'
                >
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className='text-lg font-bold'>{summary.percent_blocked.toFixed(1)}%</div>
              <p className="text-[10px] text-muted-foreground">Of total queries were blocked</p>
            </CardContent>
          </Card>
          <Card className="overflow-hidden">
            <CardHeader className='flex flex-row items-center justify-between space-y-0 p-3'>
              <CardTitle className='text-xs font-medium'>Total Clients</CardTitle>
              <div className="p-1.5 bg-purple-100 rounded-full">
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='#9333ea'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  className='h-4 w-4'
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className='text-lg font-bold'>{summary.total_clients.toLocaleString()}</div>
              <p className="text-[10px] text-muted-foreground">Unique clients in last 24h</p>
            </CardContent>
          </Card>
        </div>
        <div className='space-y-2'>
          <Suspense fallback={<NetworkGraphSkeleton />}>
            <NetworkGraph data={formattedData} />
          </Suspense>
          <Suspense fallback={<ClientActivitySkeleton />}>
            <ClientActivityGraph data={clientHistory} />
          </Suspense>

        </div>
        <div className='grid gap-2 grid-cols-1 lg:grid-cols-2'>
          <Suspense fallback={<QueryTypesSkeleton />}>
            <QueryTypesPie data={queryTypes} />
          </Suspense>

          <Suspense fallback={<QueryTypesSkeleton />}>
            <UpstreamServersPie data={upstreamServers} />
          </Suspense>

        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Top Permitted Domains</CardTitle>
            </CardHeader>
            <CardContent>
              <DomainsTable
                domains={permitted.domains}
                totalQueries={permitted.total_queries}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Blocked Domains</CardTitle>
            </CardHeader>
            <CardContent>
              <DomainsTable
                domains={blocked.domains}
                totalQueries={blocked.total_queries}
              />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Top Clients</CardTitle>
            </CardHeader>
            <CardContent>
              <ClientsTable
                clients={topClients.clients}
                totalQueries={topClients.total_queries}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Blocked Clients</CardTitle>
            </CardHeader>
            <CardContent>
              <ClientsTable
                clients={topBlockedClients.clients}
                totalQueries={topBlockedClients.total_queries}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}

export default NetworkPage;