import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Icons } from "@/components/icons";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from './ui/skeleton';

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
  uptime: number;
}

interface ServerStatsProps {
  stats: ServerStats | null;
  error?: string;
  className?: string;
}

export function ServerStats({ stats, error, className }: ServerStatsProps) {
  const formatBytes = (bytes: number) => {
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    
    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0 || parts.length === 0) parts.push(`${minutes}m`);
    
    return (
      <div className="flex items-center gap-1.5">
        <Icons.clock className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{parts.join(' ')}</span>
      </div>
    );
  };

  const getLoadColor = (load: number) => {
    if (load > 90) return 'text-red-500';
    if (load > 70) return 'text-yellow-500';
    return 'text-green-500';
  };

  if (error) {
    return (
      <Alert variant="destructive" className={className}>
        <Icons.alertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!stats) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardContent className="p-4">
          <div className="space-y-4">
            <Skeleton className="h-8 w-1/3" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array(4).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("bg-[#EAEAEB] dark:bg-[#1A1617] backdrop-blur supports-[backdrop-filter]:bg-opacity-60", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Icons.server className="h-4 w-4 text-[#C9121F]" />
            System Resources
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge 
              variant={stats ? "success" : "destructive"}
              className="transition-colors duration-300"
            >
              <span className="mr-1">●</span> {stats ? "Online" : "Offline"}
            </Badge>
            {stats && formatUptime(stats.uptime)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* CPU Card */}
          <Card className="bg-gradient-to-br from-white to-gray-100 dark:from-gray-800 dark:to-gray-900 shadow-md hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <Badge variant="outline" className="text-blue-500">CPU</Badge>
                <Icons.cpu className="h-4 w-4 text-blue-500" />
              </div>
              <div className="text-2xl font-bold mb-1">
                {stats ? `${stats.cpuLoad.currentLoad.toFixed(1)}%` : "—"}
              </div>
              <div className="text-xs text-muted-foreground">
                {stats ? `${stats.cores.logical} Cores • ${stats.temperature.main}°C` : "No data"}
              </div>
            </CardContent>
          </Card>

          {/* Memory Card */}
          <Card className="bg-gradient-to-br from-white to-gray-100 dark:from-gray-800 dark:to-gray-900 shadow-md hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <Badge variant="outline" className="text-purple-500">Memory</Badge>
                <Icons.memory className="h-4 w-4 text-purple-500" />
              </div>
              <div className="text-2xl font-bold mb-1">
                {stats ? formatBytes(stats.memory.used) : "—"}
              </div>
              <div className="text-xs text-muted-foreground">
                {stats ? `${((stats.memory.used / stats.memory.total) * 100).toFixed(1)}% Used` : "No data"}
              </div>
            </CardContent>
          </Card>

          {/* Platform Card */}
          <Card className="bg-gradient-to-br from-white to-gray-100 dark:from-gray-800 dark:to-gray-900 shadow-md hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <Badge variant="outline" className="text-green-500">Platform</Badge>
                <Icons.server className="h-4 w-4 text-green-500" />
              </div>
              <div className="text-lg font-bold mb-1 truncate">
                {stats?.platform || "—"}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {stats?.distro || "No data"}
              </div>
            </CardContent>
          </Card>

          {/* Host Card */}
          <Card className="bg-gradient-to-br from-white to-gray-100 dark:from-gray-800 dark:to-gray-900 shadow-md hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <Badge variant="outline" className="text-orange-500">Host</Badge>
                <Icons.network className="h-4 w-4 text-orange-500" />
              </div>
              <div className="text-lg font-bold mb-1 truncate">
                {stats?.hostname || "—"}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {stats?.arch || "No data"}
              </div>
            </CardContent>
          </Card>
        </div>

        {stats && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.cpuLoad.coresLoad.map((load, index) => (
              <Card key={index} className="bg-gradient-to-br from-white to-gray-100 dark:from-gray-800 dark:to-gray-900 shadow-md">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Core {index + 1}</span>
                    <span className={`font-medium ${getLoadColor(load)}`}>{load.toFixed(1)}%</span>
                  </div>
                  <Progress 
                    value={load}
                    className={cn(
                      "h-1",
                      "transition-all duration-500",
                      load > 90 ? "[&>div]:bg-red-500" :
                      load > 70 ? "[&>div]:bg-yellow-500" : "[&>div]:bg-green-500"
                    )}
                  />
                  <div className="text-xs text-right text-muted-foreground">
                    {stats.temperature.cores[index]?.toFixed(1)}°C
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
