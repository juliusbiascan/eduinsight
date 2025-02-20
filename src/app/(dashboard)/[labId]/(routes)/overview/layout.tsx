

import React from 'react';
import PageContainer from '@/components/layout/page-container';
import { DateRangeProvider } from "@/hooks/use-date-range";


export default function OverViewLayout({
    recent,
    card_stats,
    pie_stats,
    bar_stats,
    area_stats
}: {
    card_stats: React.ReactNode;
    recent: React.ReactNode;
    pie_stats: React.ReactNode;
    bar_stats: React.ReactNode;
    area_stats: React.ReactNode;
}) {


    return (
        <DateRangeProvider>
            <PageContainer>
                <div className='flex flex-1 flex-col space-y-2'>
                    {card_stats}
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7'>
                        <div className='col-span-4'>
                            {bar_stats}
                        </div>
                        <div className='col-span-4 md:col-span-3'>
                            {/* sales arallel routes */}
                            {recent}
                        </div>
                        <div className='col-span-4'>
                            {area_stats}
                        </div>
                        <div className='col-span-4 md:col-span-3'>
                            {pie_stats}
                        </div>
                    </div>
                </div>
            </PageContainer>
        </DateRangeProvider>
    );
}
