'use client';

import React from 'react';
import { useNetworkData } from '@/hooks/use-network-data';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DomainsTable } from "@/components/domains/domains-table";
import { ClientsTable } from "@/components/clients/clients-table";
import { QueryTypesPie } from "@/components/ui/query-types-pie";
import { UpstreamServersPie } from "@/components/ui/upstream-servers-pie";
import { NetworkGraph } from "@/components/ui/network-graph";
import { ClientActivityGraph } from "@/components/ui/client-activity-graph";
import { toPercent } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Heading } from "@/components/ui/heading";
import PageContainer from '@/components/layout/page-container';
import { NetworkSkeleton } from "@/components/skeletons/network-skeleton";

export default function NetworkPage() {
  const { data, loading } = useNetworkData(5000); // Update every 5 seconds

  if (loading || !data) {
    return (
      <PageContainer scrollable={false}>
        <div className='flex flex-1 flex-col space-y-4'>
          <Heading
            title="Network Statistics"
            description="Monitor your network traffic, queries, and client activities in real-time"
          />
          <Separator className="my-4" />
          <NetworkSkeleton />
        </div>
      </PageContainer>
    );
  }

  const {
    permitted,
    blocked,
    topClients,
    topBlockedClients,
    queryTypes,
    upstreamServers,
    history,
    clientHistory,
    summary
  } = data;

  const cards = [
    {
      title: "Total Queries",
      value: summary.queries?.total?.toLocaleString(),
      description: "Total DNS queries processed by the system",
      icon: <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        className="h-4 w-4 text-muted-foreground"
      >
        <path d="M21 21H3" />
        <path d="M3 7h18" />
        <path d="M3 14h18" />
      </svg>
    },
    {
      title: "Blocked Queries",
      value: summary.queries?.blocked?.toLocaleString(),
      description: "Number of DNS queries blocked by filters",
      icon: <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        className="h-4 w-4 text-muted-foreground"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    },
    {
      title: "Percentage Blocked",
      value: toPercent(summary.queries?.percent_blocked, 1),
      description: "Percentage of total queries that were blocked",
      icon: <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        className="h-4 w-4 text-muted-foreground"
      >
        <path d="M19 18a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v12z" />
        <path d="M16 12h-8" />
        <path d="M12 16V8" />
      </svg>
    },
    {
      title: "Domain on List",
      value: summary.gravity?.domains_being_blocked?.toLocaleString(),
      description: "Total number of domains in the blocklist",
      icon: <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        className="h-4 w-4 text-muted-foreground"
      >
        <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" />
      </svg>
    }
  ];

  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col space-y-4'>

        <Heading
          title="Network Statistics"
          description="Monitor your network traffic, queries, and client activities in real-time"
        />
        <Separator className="my-4" />


        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {cards.map((card, index) => (
            <Card key={index} className="col-span-1">
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium truncate'>{card.title}</CardTitle>
                {card.icon}
              </CardHeader>
              <CardContent>
                <div className='text-lg sm:text-2xl font-bold'>{card.value}</div>
                <p className='text-xs text-muted-foreground line-clamp-2'>
                  {card.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <NetworkGraph data={history} />
          <ClientActivityGraph data={clientHistory} />
        </div>


        <div className="grid gap-4 md:grid-cols-2">
          <QueryTypesPie data={queryTypes} />
          <UpstreamServersPie data={upstreamServers} />
        </div>


        <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 md:gap-4">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Top Permitted Domains</CardTitle>
            </CardHeader>
            <CardContent>
              <DomainsTable domains={permitted.domains} totalQueries={permitted.total_queries} />
            </CardContent>
          </Card>
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Top Blocked Domains</CardTitle>
            </CardHeader>
            <CardContent>
              <DomainsTable domains={blocked.domains} totalQueries={blocked.total_queries} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 md:gap-4">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Top Clients</CardTitle>
            </CardHeader>
            <CardContent>
              <ClientsTable clients={topClients.clients} totalQueries={topClients.total_queries} />
            </CardContent>
          </Card>
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Top Blocked Clients</CardTitle>
            </CardHeader>
            <CardContent>
              <ClientsTable clients={topBlockedClients.clients} totalQueries={topBlockedClients.total_queries} />
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}