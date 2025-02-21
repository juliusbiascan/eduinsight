'use client'

import { CalendarDateRangePicker } from "@/components/date-range-picker";
import { DateRange } from "react-day-picker";

export default function DatePickerWrapper() {
  return (
    <CalendarDateRangePicker 
      value={undefined} 
      onChange={(range: DateRange | undefined) => {
        // Handle date range changes here
      }} 
    />
  );
}
