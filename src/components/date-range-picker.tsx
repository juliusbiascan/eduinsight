"use client";

import * as React from "react";
import { CalendarIcon, Sun, Clock } from "lucide-react"; // Updated imports
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
  const [tempRange, setTempRange] = React.useState<DateRange | undefined>(value);
  const [selecting, setSelecting] = React.useState<'start' | 'end'>('start');

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    if (selecting === 'start') {
      setTempRange({ from: date, to: undefined });
    } else {
      if (tempRange?.from) {
        if (date < tempRange.from) {
          setTempRange({ from: date, to: tempRange.from });
        } else {
          setTempRange({ from: tempRange.from, to: date });
        }
      }
    }
  };

  const handleConfirmDate = () => {
    if (selecting === 'start') {
      setSelecting('end');
    } else {
      if (tempRange?.from && tempRange.to) {
        onChange(tempRange);
        setSelecting('start');
      }
    }
  };

  const handleClear = () => {
    setTempRange(undefined);
    setSelecting('start');
    onChange(undefined);
  };

  const handlePreset = (preset: 'today' | 'last7Days' | 'last30Days') => {
    const today = new Date();
    let from: Date | undefined;
    let to: Date = today;

    switch (preset) {
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
          <div className="text-sm font-medium mb-2">
            {selecting === 'start' ? 'Select start date' : 'Select end date'}
          </div>
          <Calendar
            mode="single"
            defaultMonth={value?.from}
            selected={selecting === 'start' ? tempRange?.from : tempRange?.to}
            onSelect={handleDateSelect}

            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm"
            disabled={selecting === 'end' && tempRange?.from ? { before: tempRange.from } : undefined}
          />
          <div className="flex justify-end space-x-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
            >
              Clear
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmDate}
              disabled={selecting === 'start' ? !tempRange?.from : !tempRange?.to}
            >
              {selecting === 'start' ? 'Set Start Date' : 'Set End Date'}
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
