"use client";

import { motion } from 'framer-motion';
import { Activity, Laptop, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateTrend, getTrendDescription } from '@/lib/utils/calculate-trend';

interface MonitoringStatsProps {
  activeCount: number;
  inactiveCount: number;
}

export const MonitoringStats: React.FC<MonitoringStatsProps> = ({
  activeCount,
  inactiveCount,
}) => {
  const cards = [
    {
      title: "Active Devices",
      value: activeCount,
      icon: <Activity className='h-4 w-4 text-muted-foreground' />,
    },
    {
      title: "Inactive Devices",
      value: inactiveCount,
      icon: <Laptop className='h-4 w-4 text-muted-foreground' />,
    },
    {
      title: "Total Devices",
      value: activeCount + inactiveCount,
      icon: <Users className='h-4 w-4 text-muted-foreground' />,
    }
  ];

  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
      {cards.map((card, index) => (
        <Card key={index}>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>{card.title}</CardTitle>
            {card.icon}
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {card.value}
            </div>
            <p className='text-xs text-muted-foreground'>
              Real-time device status
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
