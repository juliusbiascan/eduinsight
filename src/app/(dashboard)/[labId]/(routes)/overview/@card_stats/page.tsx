'use client';

import { CalendarDateRangePicker } from '@/components/date-range-picker';
import { Icons } from '@/components/icons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { Download, TrendingUp, Users } from 'lucide-react';
import { DashboardReport } from '../../../../../../components/dashboard-report';
import { addDays, format } from 'date-fns';
import { useCallback, useEffect, useState } from 'react';
import loading from '../../devices/loading';
import { getActiveCount, getStudentCount, getTeacherCount } from '@/actions/staff';
import { getTotalDevices, getDevicesList } from '@/data/device';
import { getGraphLogins, getRecentLogins } from '@/data/get-graph-count';
import { getPreviousStats } from '@/data/stats';
import { getAllDeviceUserCount, getUsersList } from '@/data/user';
import { Device, DeviceUser } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { DateRange } from 'react-day-picker';
import { useDateRange } from '@/hooks/use-date-range';
import { DashboardContextMenu } from '@/components/dashboard-context-menu';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Skeleton } from '@/components/ui/skeleton';
import { calculateTrend, getTrendDescription } from '@/lib/utils/calculate-trend';

interface GraphData {
    name: string;
    total: number;
}

interface RecentLoginData {
    id: string;
    labId: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    device: Device;
    user: DeviceUser;
}

interface DashboardData {
    allDevices: number;
    activeCount: number;
    allUser: number;
    graphLogin: GraphData[];
    recentLogin: RecentLoginData[];
    previousStats: {
        totalLogins: number;
        totalUsers: number;
        totalDevices: number;
        activeNow: number;
    };
    devices: Device[];
    users: Array<{
        id: string;
        firstName: string;
        lastName: string;
        role: string;
    }>;
}

const CardStatsPage = ({
    params
}: {
    params: { labId: string }
}) => {

    const [loading, setLoading] = useState(false);
    const { dateRange, setDateRange } = useDateRange();
    const [datePickerOpen, setDatePickerOpen] = useState(false);

    const [data, setData] = useState<DashboardData>({
        allDevices: 0,
        activeCount: 0,
        allUser: 0,
        graphLogin: [],
        recentLogin: [],
        previousStats: {
            totalLogins: 0,
            totalUsers: 0,
            totalDevices: 0,
            activeNow: 0,
           
        },
        devices: [],
        users: [],
    });

    const fetchData = useCallback(
        async (newDateRange: DateRange) => {
            setLoading(true);
            const [
                allDevices,
                activeCount,
                allUser,
                graphLogin,
                recentLogin,
                previousStats,
        
                devicesList, // Fetch devices list
                usersList, // Fetch users list
            ] = await Promise.all([
                getTotalDevices(params.labId, newDateRange),
                getActiveCount(params.labId, newDateRange),
                getAllDeviceUserCount(newDateRange),
                getGraphLogins(params.labId, newDateRange),
                getRecentLogins(params.labId, newDateRange),
                getPreviousStats(params.labId, newDateRange),
                getDevicesList(params.labId, newDateRange), // Ensure this function exists
                getUsersList(newDateRange), // Ensure this function exists
            ]);

            setData({
                allDevices: allDevices || 0,
                activeCount: activeCount || 0,
                allUser: allUser || 0,
                graphLogin: graphLogin || [],
                recentLogin: recentLogin || [],
                previousStats: previousStats || {
                    totalLogins: 0,
                    totalUsers: 0,
                    totalDevices: 0,
                    activeNow: 0,
                },
            
                devices: devicesList || [],
                users: usersList || [],
            });
            setLoading(false);
        },
        [params.labId]
    );

    useEffect(() => {
        fetchData(dateRange);
    }, [dateRange, params.labId, fetchData]);

    const handleDateRangeChange = (newRange: DateRange | undefined) => {
        if (newRange && newRange.from && newRange.to) {
            setDateRange(newRange);
            fetchData(newRange);
        }
    };

    const generateReportData = useCallback(() => {
        return {
            totalLogins: data.recentLogin.length,
            totalUsers: data.allUser,
            totalDevices: data.allDevices,
            activeNow: data.activeCount,
            devices: data.devices,
            users: data.users,
            dateRange,
        };
    }, [
        data.recentLogin.length,
        data.allUser,
        data.allDevices,
        data.activeCount,
        data.devices,
        data.users,
        dateRange,
    ]);

    const handleDatePickerClick = () => {
        setDatePickerOpen(true);
    };

    if (loading) {
        return (
            <>
                <div className='flex items-center justify-between space-y-2'>
                    <Skeleton className="h-8 w-[200px]" />
                    <div className="hidden sm:flex flex-row items-center w-auto gap-2">
                        <Skeleton className="h-9 w-[300px]" />
                        <Skeleton className="h-9 w-[150px]" />
                    </div>
                </div>
                <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
                    {[1, 2, 3, 4].map((index) => (
                        <Card key={index}>
                            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                                <Skeleton className="h-5 w-[120px]" />
                                <Skeleton className="h-4 w-4" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-[100px] mb-2" />
                                <Skeleton className="h-4 w-[180px]" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </>
        );
    }

    return (
        <>
            <div className='flex items-center justify-between space-y-2'>
                <h2 className='text-2xl font-bold tracking-tight'>
                    Hi, Welcome back 👋
                </h2>
                <div className="hidden sm:flex flex-row items-center w-auto gap-2">
                    <CalendarDateRangePicker
                        value={dateRange}
                        onChange={handleDateRangeChange}
                    />
                    <PDFDownloadLink
                        document={<DashboardReport data={generateReportData()} />}
                        fileName={`dashboard-report-${format(
                            new Date(),
                            "yyyy-MM-dd"
                        )}.pdf`}
                    >
                        <Button
                            size="sm"
                            className="bg-[#C9121F] hover:bg-red-700 text-white text-sm py-1 h-8"
                            disabled={loading}
                        >
                            <Download className="h-4 w-4 mr-1" />
                            Download Report
                        </Button>
                    </PDFDownloadLink>
                </div>
                <div className="sm:hidden">
                    <DashboardContextMenu
                        dateRange={dateRange}
                        onDateClick={handleDatePickerClick}
                        onDownloadClick={() => document.getElementById('download-pdf')?.click()}
                        loading={loading}
                    />
                </div>
            </div>

            {/* Hidden PDFDownloadLink for mobile */}
            <div className="hidden">


                <PDFDownloadLink
                    document={<DashboardReport data={generateReportData()} />}
                    fileName={`dashboard-report-${format(
                        new Date(),
                        "yyyy-MM-dd"
                    )}.pdf`}
                >
                    <Button
                        size="sm"
                        className="bg-[#C9121F] hover:bg-red-700 text-white text-sm py-1 h-8 w-full sm:w-auto"
                        disabled={loading}
                    >
                        <Download className="h-4 w-4 mr-1" />
                        Download Report
                    </Button>
                </PDFDownloadLink>
            </div>

            {/* Date Picker Dialog for mobile */}
            <Dialog open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <CalendarDateRangePicker
                        value={dateRange}
                        onChange={(newRange) => {
                            handleDateRangeChange(newRange);
                            setDatePickerOpen(false);
                        }}
                    />
                </DialogContent>
            </Dialog>

            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
                {[
                    {
                        title: "Lab Session Count",
                        value: data.recentLogin.length,
                        previousValue: data.previousStats.totalLogins,
                        icon: <TrendingUp className='h-4 w-4 text-muted-foreground' />,
                        prefix: "+"
                    },
                    {
                        title: "Lab Workstations",
                        value: data.allDevices,
                        previousValue: data.previousStats.totalDevices,
                        icon: <Icons.devices className='h-4 w-4 text-muted-foreground' />,
                    },
                    {
                        title: "Registered Users",
                        value: data.allUser,
                        previousValue: data.previousStats.totalUsers,
                        icon: <Users className='h-4 w-4 text-muted-foreground' />,
                    },
                    {
                        title: "Current Lab Users",
                        value: data.activeCount,
                        previousValue: data.previousStats.activeNow,
                        icon: <svg
                            xmlns='http://www.w3.org/2000/svg'
                            viewBox='0 0 24 24'
                            fill='none'
                            stroke='currentColor'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth='2'
                            className='h-4 w-4 text-muted-foreground'
                        >
                            <path d='M22 12h-4l-3 9L9 3l-3 9H2' />
                        </svg>,
                    }
                ].map((card, index) => (
                    <Card key={index}>
                        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                            <CardTitle className='text-sm font-medium'>{card.title}</CardTitle>
                            {card.icon}
                        </CardHeader>
                        <CardContent>
                            <div className='text-2xl font-bold'>
                                {card.prefix || ''}{card.value}
                            </div>
                            <p className='text-xs text-muted-foreground'>
                                {(() => {
                                    const trend = calculateTrend(card.value, card.previousValue);
                                    return `${trend >= 0 ? '↑' : '↓'} ${Math.abs(trend)}% ${getTrendDescription(dateRange.from, dateRange.to)}`;
                                })()}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </>
    );
}

export default CardStatsPage;