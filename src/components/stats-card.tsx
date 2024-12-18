"use client"

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  trend?: number;
  description?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, trend, description }) => {
  const trendIcon = trend && trend >= 0 ? "↑" : "↓";

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card className="overflow-hidden bg-gradient-to-br from-white to-gray-100 dark:from-gray-800 dark:to-gray-900 shadow-md hover:shadow-xl transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-opacity-50 backdrop-blur-sm">
          <CardTitle className="text-lg font-semibold text-primary">
            {title}
          </CardTitle>
          <div className="text-3xl text-secondary-foreground">{icon}</div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex flex-col items-start space-y-2">
            <div className="text-4xl font-bold text-foreground">{value.toLocaleString()}</div>
            {trend !== undefined && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <motion.span
                      className={cn("text-sm font-semibold px-2 py-1 rounded-full",
                        trend >= 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800")}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      {trendIcon} {Math.abs(trend)}%
                    </motion.span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{`${Math.abs(trend)}% ${trend >= 0 ? 'increase' : 'decrease'} from last period`}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          {description && (
            <motion.p
              className="mt-3 text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {description}
            </motion.p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};