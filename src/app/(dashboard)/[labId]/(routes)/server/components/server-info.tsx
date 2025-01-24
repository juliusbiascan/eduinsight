"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Icons } from "@/components/icons";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ServerStats {
  hostname: string;
  platform: string;
  distro: string;
  arch: string;
  cpuModel: string;
  cores: {
    physical: number;
    logical: number;
    speeds: number;
  };
  temperature: {
    main: number;
    cores: number[];
  };
  cpuLoad: {
    currentLoad: number;
    coresLoad: number[];
  };
  memory: {
    total: number;
    free: number;
    used: number;
    active: number;
  };
  uptime: number; // in seconds
}

export const ServerInformation = () => {
  const [stats, setStats] = useState<ServerStats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const response = await fetch('/api/server-info');
      const data = await response.json();
      setStats(data);
    };

    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatBytes = (bytes: number) => {
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (!stats) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold mb-4">Server Information</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-4">
              <CardHeader>
                <Skeleton className="h-4 w-[150px]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[100px] w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Server Information</h2>
        <span className="text-sm text-muted-foreground">
          Auto-refreshing every 5s
        </span>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cpu">CPU</TabsTrigger>
          <TabsTrigger value="memory">Memory</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Info</CardTitle>
                <Icons.server className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="font-medium">Uptime:</dt>
                    <dd>{formatUptime(stats.uptime)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium">Hostname:</dt>
                    <dd>{stats.hostname}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium">Platform:</dt>
                    <dd>{stats.platform} ({stats.distro})</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium">Architecture:</dt>
                    <dd>{stats.arch}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">CPU Overview</CardTitle>
                <Icons.cpu className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">CPU Load</span>
                      <span className="text-sm text-muted-foreground">
                        {stats.cpuLoad.currentLoad.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={stats.cpuLoad.currentLoad} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm">
                      {stats.cpuModel}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {stats.cores.physical} Physical / {stats.cores.logical} Logical Cores
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cpu" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>CPU Cores Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {stats.cpuLoad.coresLoad.map((load, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Core {index + 1}</span>
                      <span className="text-sm text-muted-foreground">
                        {load.toFixed(1)}% | {stats.temperature.cores[index] ? `${stats.temperature.cores[index]}°C` : 'N/A'}
                      </span>
                    </div>
                    <Progress value={load} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="memory" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>Memory Usage</CardTitle>
              <Icons.memory className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Used Memory</span>
                    <span className="text-sm text-muted-foreground">
                      {formatBytes(stats.memory.used)} of {formatBytes(stats.memory.total)}
                    </span>
                  </div>
                  <Progress value={(stats.memory.used / stats.memory.total) * 100} />
                </div>
                
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Free Memory</TableCell>
                      <TableCell>{formatBytes(stats.memory.free)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Active Memory</TableCell>
                      <TableCell>{formatBytes(stats.memory.active)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

