import React from 'react';
import PageContainer from '@/components/layout/page-container';
import { DateRangeProvider } from "@/hooks/use-date-range";
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';

export const metadata = {
    title: 'Dashboard: Overview'
};

export default async function OverViewLayout({
    recent,
    card_stats,
    pie_stats,
    bar_stats,
    area_stats,
    params
}: {
    card_stats: React.ReactNode;
    recent: React.ReactNode;
    pie_stats: React.ReactNode;
    bar_stats: React.ReactNode;
    area_stats: React.ReactNode;
    params: { labId: string };
}) {
    const session = await auth();

    if (!session) redirect("/auth/login");

    const team = await db.team.findFirst({
        where: {
            labId: params.labId,
            users: {
                some: {
                    id: session.user.id,
                },
            }
        }
    });

    if (team) {
        const lab = await db.labaratory.findFirst({
            where: {
                id: team.labId,
            },
        });

        if (!lab) {
            redirect('/');
        }
    } else {
        const lab = await db.labaratory.findFirst({ where: { id: params.labId, userId: session.user.id } });

        if (!lab) {
            redirect('/');
        } 
    }


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
