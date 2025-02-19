"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { ServerStats } from "./server-stats";
import { Icons } from "@/components/icons";

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

interface ServiceStatus {
    api: boolean;
    database: boolean;
    storage: boolean;
}

interface HealthCheckResponse {
    status: 'operational' | 'warning' | 'error';
    services: ServiceStatus;
    timestamp: string;
}

interface ServerStatusModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ServerStatusModal = ({ isOpen, onClose }: ServerStatusModalProps) => {
    const [stats, setStats] = useState<ServerStats | null>(null);
    const [statsError, setStatsError] = useState<string>();
    const [isStatsLoading, setIsStatsLoading] = useState(true);
    const [services, setServices] = useState({
        api: true,
        database: true,
        storage: true
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setIsStatsLoading(true);
                const response = await fetch('/api/server-info');
                if (!response.ok) throw new Error('Failed to fetch server info');
                const data = await response.json();
                setStats(data);
                setStatsError(undefined);
            } catch (error) {
                setStatsError(error instanceof Error ? error.message : 'Unknown error occurred');
            } finally {
                setIsStatsLoading(false);
            }
        };

        fetchStats();
        const interval = setInterval(fetchStats, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await fetch('/api/health-check');
                if (!response.ok) throw new Error('Failed to fetch health status');
                const data: HealthCheckResponse = await response.json();
                setServices(data.services);
            } catch (error) {
                setServices({
                    api: false,
                    database: false,
                    storage: false,
                });
            }
        };

        if (isOpen) {
            fetchServices();
            const interval = setInterval(fetchServices, 30000);
            return () => clearInterval(interval);
        }
    }, [isOpen]);

    const ServiceStatus = ({ name, isOperational }: { name: string; isOperational: boolean }) => (
        <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
            <div className="flex items-center gap-2">
                <Icons.server className="h-4 w-4 text-muted-foreground" />
                <span>{name}</span>
            </div>
            <div className="flex items-center">
                <div className={`h-3 w-3 rounded-full mr-2 ${isOperational ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                    }`} />
                <span className="text-sm">
                    {isOperational ? 'Operational' : 'Down'}
                </span>
            </div>
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Icons.activity className="h-5 w-5 text-primary" />
                        System Status
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    <ServerStats
                        stats={stats}
                        error={statsError}
                        className="bg-background/50 backdrop-blur-sm"
                    />
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold">Services Status</h3>
                        <div className="space-y-2">
                            <ServiceStatus name="API Server" isOperational={services.api} />
                            <ServiceStatus name="Database" isOperational={services.database} />
                            <ServiceStatus name="Storage" isOperational={services.storage} />
                        </div>
                    </div>
                </div>

            </DialogContent>
        </Dialog>
    );
};
