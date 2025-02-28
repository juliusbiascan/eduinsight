import React from 'react'
import { Separator } from '@/components/ui/separator'
import { Heading } from '@/components/ui/heading'
import PageContainer from '@/components/layout/page-container'
import { getTopDomains, getTopClients, getQueryTypes, getUpstreamServers, getHistory, getClientHistory, getDatabaseSummary } from "@/lib/pihole";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DomainsTable } from "@/components/domains/domains-table";
import { ClientsTable } from "@/components/clients/clients-table";
import { QueryTypesPie } from "@/components/ui/query-types-pie";
import { UpstreamServersPie } from "@/components/ui/upstream-servers-pie";
import { NetworkGraph } from "@/components/ui/network-graph";
import { ClientActivityGraph } from "@/components/ui/client-activity-graph";

export default async function NetworkPage() {
  const [
    permitted,
    blocked,
    topClients,
    topBlockedClients,
    queryTypes,
    upstreamServers,
    history,
    clientHistory,
    summary
  ] = await Promise.all([
    getTopDomains(10, false),
    getTopDomains(10, true),
    getTopClients(10, false),
    getTopClients(10, true),
    getQueryTypes(),
    getUpstreamServers(),
    getHistory(),
    getClientHistory(0),
    getDatabaseSummary()
  ]);

  const formattedHistory = history.map(entry => ({
    ...entry,
    timestamp: new Date(entry.timestamp * 1000).toISOString()
  }));

  const cards = [
    {
      title: "Total Queries",
      value: summary.sum_queries.toLocaleString(),
      description: "Total DNS queries in last 24h",
      icon: (
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
      )
    },
    {
      title: "Blocked Queries",
      value: summary.sum_blocked.toLocaleString(),
      description: "DNS queries blocked in last 24h",
      icon: (
        <div className="p-1.5 bg-red-100 rounded-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ef4444"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </div>
      )
    },
    {
      title: "Percentage Blocked",
      value: `${((summary.sum_blocked / summary.sum_queries) * 100).toFixed(1)}%`,
      description: "Percentage of queries blocked",
      icon: (
        <div className="p-1.5 bg-blue-100 rounded-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#3b82f6"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4"
          >
            <path d="M12 20v-6" />
            <path d="M12 8V4" />
            <path d="M5 12H2" />
            <path d="M22 12h-3" />
          </svg>
        </div>
      )
    },
    {
      title: "Unique Clients",
      value: summary.total_clients.toLocaleString(),
      description: "Unique client queried in 24h",
      icon: (
        <div className="p-1.5 bg-purple-100 rounded-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#9333ea"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4"
          >
            <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 0 1 9-9" />
          </svg>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4 p-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader className='flex flex-row items-center justify-between space-y-0 p-3'>
              <CardTitle className='text-xs font-medium'>{card.title}</CardTitle>
              {card.icon}
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className='text-lg font-bold'>{card.value}</div>
              <p className="text-[10px] text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <NetworkGraph data={formattedHistory} />
      <ClientActivityGraph data={clientHistory} />

      {/* Query Types and Upstream Servers */}
      <div className="grid gap-4 md:grid-cols-2">
        <QueryTypesPie data={queryTypes} />

        <UpstreamServersPie data={upstreamServers} />
      </div>

      {/* Domains and Clients Tables */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Permitted Domains</CardTitle>
          </CardHeader>
          <CardContent>
            <DomainsTable domains={permitted.domains} totalQueries={permitted.total_queries} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top Blocked Domains</CardTitle>
          </CardHeader>
          <CardContent>
            <DomainsTable domains={blocked.domains} totalQueries={blocked.total_queries} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <ClientsTable clients={topClients.clients} totalQueries={topClients.total_queries} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top Blocked Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <ClientsTable clients={topBlockedClients.clients} totalQueries={topBlockedClients.total_queries} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}