import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Download, Calendar } from "lucide-react";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";

interface DashboardContextMenuProps {
  onDateClick: () => void;
  dateRange: DateRange | undefined;
  onDownloadClick: () => void;
  loading?: boolean;
}

export function DashboardContextMenu({
  onDateClick,
  dateRange,
  onDownloadClick,
  loading
}: DashboardContextMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onDateClick} className="cursor-pointer">
          <Calendar className="h-4 w-4 mr-2" />
          <span>
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "LLL dd, y")} -{" "}
                  {format(dateRange.to, "LLL dd, y")}
                </>
              ) : (
                format(dateRange.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={onDownloadClick} 
          className="cursor-pointer"
          disabled={loading}
        >
          <Download className="h-4 w-4 mr-2" />
          <span>Download Report</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
