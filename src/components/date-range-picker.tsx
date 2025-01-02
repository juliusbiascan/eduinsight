"use client";

import * as React from "react";
import { CalendarIcon, Sun, Clock} from "lucide-react"; // Updated imports
import { format, addDays } from "date-fns";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface CalendarDateRangePickerProps {
  className?: string;
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
}

export function CalendarDateRangePicker({
  className,
  value,
  onChange,
}: CalendarDateRangePickerProps) {
  const handlePreset = (preset: 'today' | 'last7Days' | 'last30Days') => {
    const today = new Date();
    let from: Date | undefined;
    let to: Date = today;
    
    switch(preset) {
      case 'today':
        from = today;
        break;
      case 'last7Days':
        from = addDays(today, -6);
        break;
      case 'last30Days':
        from = addDays(today, -29);
        break;
      default:
        from = undefined;
    }
    
    onChange(from && to ? { from, to } : undefined);
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            size="sm"
            className={cn(
              "w-[260px] justify-start text-left font-normal",
              !value && "text-muted-foreground",
              "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
            {value?.from ? (
              value.to ? (
                <>
                  {format(value.from, "LLL dd, y")} -{" "}
                  {format(value.to, "LLL dd, y")}
                </>
              ) : (
                format(value.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4" align="end">
          <div className="flex flex-col space-y-2 mb-4">
            <Button
              size="sm"
              variant="secondary"
              className="flex items-center justify-center space-x-2"
              onClick={() => handlePreset('today')}
            >
              <Sun className="h-4 w-4" /> {/* Replaced TodayIcon */}
              <span>Today</span>
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="flex items-center justify-center space-x-2"
              onClick={() => handlePreset('last7Days')}
            >
              <Clock className="h-4 w-4" /> {/* Replaced WeekIcon */}
              <span>Last 7 Days</span>
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="flex items-center justify-center space-x-2"
              onClick={() => handlePreset('last30Days')}
            >
              <CalendarIcon className="h-4 w-4" /> {/* Replaced MonthIcon */}
              <span>Last 30 Days</span>
            </Button>
          </div>
          <hr className="border-gray-300 dark:border-gray-700 mb-4" />
          <Calendar
            mode="range"
            defaultMonth={value?.from}
            selected={value}
            onSelect={onChange}
            numberOfMonths={2}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
