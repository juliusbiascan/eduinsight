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
        studentCount: number;
        teacherCount: number;
    };
    studentCount: number;
    teacherCount: number;
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
            studentCount: 0,
            teacherCount: 0,
        },
        studentCount: 0,
        teacherCount: 0,
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
                studentCount,
                teacherCount,
                devicesList, // Fetch devices list
                usersList, // Fetch users list
            ] = await Promise.all([
                getTotalDevices(params.labId, newDateRange),
                getActiveCount(params.labId, newDateRange),
                getAllDeviceUserCount(params.labId, newDateRange),
                getGraphLogins(params.labId, newDateRange),
                getRecentLogins(params.labId, newDateRange),
                getPreviousStats(params.labId, newDateRange),
                getStudentCount(params.labId, newDateRange),
                getTeacherCount(params.labId, newDateRange),
                getDevicesList(params.labId, newDateRange), // Ensure this function exists
                getUsersList(params.labId, newDateRange), // Ensure this function exists
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
                    studentCount: 0,
                    teacherCount: 0,
                },
                studentCount: studentCount || 0,
                teacherCount: teacherCount || 0,
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
            studentCount: data.studentCount,
            teacherCount: data.teacherCount,
            devices: data.devices,
            users: data.users,
            dateRange,
        };
    }, [
        data.recentLogin.length,
        data.allUser,
        data.allDevices,
        data.activeCount,
        data.studentCount,
        data.teacherCount,
        data.devices,
        data.users,
        dateRange,
    ]);

    const getTrendDescription = useCallback((from?: Date, to?: Date) => {
        if (!from || !to) return "from previous period";
        const diffInDays = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffInDays <= 1) return "from yesterday";
        if (diffInDays <= 7) return "from last week";
        if (diffInDays <= 30) return "from last month";
        if (diffInDays <= 90) return "from last quarter";
        return "from previous period";
    }, []);

    const calculateTrend = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        const trend = ((current - previous) / previous) * 100;
        return Number(trend.toFixed(2));
    };

    return (

        <>
            <div className='flex items-center justify-between space-y-2'>
                <h2 className='text-2xl font-bold tracking-tight'>
                    Hi, Welcome back 👋
                </h2>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center w-full sm:w-auto gap-2">
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
                            className="bg-[#C9121F] hover:bg-red-700 text-white text-sm py-1 h-8 w-full sm:w-auto"
                            disabled={loading}
                        >
                            <Download className="h-4 w-4 mr-1" />
                            Download Report
                        </Button>
                    </PDFDownloadLink>
                </div>
            </div>
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
                <Card>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                        <CardTitle className='text-sm font-medium'>
                            Total Visitors
                        </CardTitle>
                        <TrendingUp className='h-4 w-4 text-muted-foreground' />
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold'>+{data.recentLogin.length}</div>
                        <p className='text-xs text-muted-foreground'>
                            {calculateTrend(
                                data.recentLogin.length,
                                data.previousStats.totalLogins
                            )}% {getTrendDescription(dateRange.from, dateRange.to)}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                        <CardTitle className='text-sm font-medium'>
                            Devices
                        </CardTitle>
                        <Icons.devices className='h-4 w-4 text-muted-foreground' />
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold'>+{data.allDevices}</div>
                        <p className='text-xs text-muted-foreground'>
                            {calculateTrend(
                                data.allDevices,
                                data.previousStats.totalDevices
                            )}% {getTrendDescription(dateRange.from, dateRange.to)}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                        <CardTitle className='text-sm font-medium'>Users</CardTitle>
                        <Users className='h-4 w-4 text-muted-foreground' />
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold'>{data.studentCount}</div>
                        <p className='text-xs text-muted-foreground'>
                            {calculateTrend(
                                data.studentCount,
                                data.previousStats.studentCount
                            )}% {getTrendDescription(dateRange.from, dateRange.to)}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                        <CardTitle className='text-sm font-medium'>Active Now</CardTitle>
                        <svg
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
                        </svg>
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold'>+{data.activeCount}</div>
                        <p className='text-xs text-muted-foreground'>
                            {calculateTrend(
                                data.activeCount,
                                data.previousStats.activeNow
                            )}% {getTrendDescription(dateRange.from, dateRange.to)}
                        </p>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

export default CardStatsPage;