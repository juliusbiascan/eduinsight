"use client";

import { useState, useEffect } from "react";
import { ServerIcon } from "@heroicons/react/24/solid";
import { ServerStatusModal } from "./server-status-modal";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

interface ServerStatusButtonProps {
  className?: string;
}

export const ServerStatusButton = ({ className }: ServerStatusButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<'operational' | 'warning' | 'error'>('operational');

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch('/api/health-check');
        if (!response.ok) {
          setStatus('error');
          return;
        }
        const data = await response.json();
        setStatus(data.status);
      } catch {
        setStatus('error');
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const statusColors = {
    operational: 'text-green-500',
    warning: 'text-yellow-500',
    error: 'text-red-500'
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setIsOpen(true)}
              className={cn(
                "relative inline-flex items-center justify-center rounded-md p-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background hover:bg-accent",
                className
              )}
            >
              <ServerIcon className={cn("h-5 w-5", statusColors[status])} />
              <span className={cn(
                "absolute -top-1 -right-1 h-2 w-2 rounded-full",
                statusColors[status],
                status === 'operational' ? 'animate-ping' : ''
              )} />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>System Status: {status.charAt(0).toUpperCase() + status.slice(1)}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <ServerStatusModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};
