import { DataTable } from '@/components/ui/table/data-table';
import { columns } from './user-tables/columns';
import { db } from '@/lib/db';
import { searchParamsCache } from '@/lib/searchparams';
import { Course, DeviceUserRole, State, YearLevel } from '@prisma/client';

export default async function UserListingPage() {
    const page = searchParamsCache.get('page');
    const pageLimit = searchParamsCache.get('limit');
    const search = searchParamsCache.get('q');
    const course = searchParamsCache.get('course');
    const role = searchParamsCache.get('role');
    const yearLevel = searchParamsCache.get('yearLevel');

    const users = await db.deviceUser.findMany({
        skip: (page - 1) * pageLimit,
        take: pageLimit,
        where: {
            ...(search && {
                OR: [
                    {
                        firstName: {
                            contains: search,
                        }
                    },
                    {
                        lastName: {
                            contains: search,
                        }
                    },
                    {
                        email: {
                            contains: search,
                        }
                    },
                ]
            }),
            ...(course && {
                OR: course.split('.').map(c => ({
                    course: c as Course
                }))
            }),
            ...(role && {
                OR: role.split('.').map(r => ({
                    role: r as DeviceUserRole
                }))
            }),
            ...(yearLevel && {
                OR: yearLevel.split('.').map(y => ({
                    yearLevel: y as YearLevel
                }))
            }),
        },
        include: {
            activeDevices: {
                where: { state: State.ACTIVE }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <DataTable
            columns={columns}
            data={users}
            totalItems={users.length}
        />
    );
}
