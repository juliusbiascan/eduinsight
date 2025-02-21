import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DateRangeProvider } from "@/hooks/use-date-range";
import PageContainer from "@/components/layout/page-container";
import { Activity, Users, Clock, Cpu, TrendingUp } from "lucide-react";
import DatePickerWrapper from "@/components/analytics/date-picker-wrapper";
import { DateRange } from "react-day-picker";

export default function AnalyticsLayout({
  overview,
  usage,
  performance,
  patterns,
}: {
  overview: React.ReactNode;
  usage: React.ReactNode;
  performance: React.ReactNode;
  patterns: React.ReactNode;
}) {
  const sections = {
    overview: { label: "Overview", icon: <TrendingUp className="h-4 w-4" />, content: overview },
    usage: { label: "Usage Analytics", icon: <Activity className="h-4 w-4" />, content: usage },
    performance: { label: "Performance", icon: <Cpu className="h-4 w-4" />, content: performance },
    patterns: { label: "Usage Patterns", icon: <Clock className="h-4 w-4" />, content: patterns },
  };

  return (
    <DateRangeProvider>
      <PageContainer>
      <div className='flex flex-1 flex-col space-y-2'>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h1>
            <DatePickerWrapper />
          </div>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              {Object.entries(sections).map(([key, section]) => (
                <TabsTrigger key={key} value={key} className="gap-2">
                  {section.icon}
                  {section.label}
                </TabsTrigger>
              ))}
            </TabsList>
            <ScrollArea className="h-full">
              {Object.entries(sections).map(([key, section]) => (
                <TabsContent key={key} value={key} className="space-y-4">
                  {section.content}
                </TabsContent>
              ))}
            </ScrollArea>
          </Tabs>
        </div>
      </PageContainer>
    </DateRangeProvider>
  );
}
