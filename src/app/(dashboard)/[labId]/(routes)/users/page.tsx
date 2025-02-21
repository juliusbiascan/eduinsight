import PageContainer from '@/components/layout/page-container';
import { buttonVariants } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { searchParamsCache } from '@/lib/searchparams';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { SearchParams } from 'nuqs/server';
import { Suspense } from 'react';
import UserListingPage from './components/user-listing';
import UserTableAction from './components/user-tables/user-table-action';

type pageProps = {
  searchParams: Promise<SearchParams>;
  params: { labId: string }
};

export default async function Page({ searchParams, params }: pageProps) {
  await searchParamsCache.parse(searchParams);
  const key = JSON.stringify(searchParams);

  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading
            title='Users'
            description='Manage registered device users'
          />
          <Link
            href={`/${params.labId}/users/register`}
            className={cn(buttonVariants(), 'text-xs md:text-sm')}
          >
            <Plus className='mr-2 h-4 w-4' /> Pre Register
          </Link>
        </div>
        <Separator />
        <UserTableAction />
        <Suspense
          key={key}
          fallback={<DataTableSkeleton columnCount={6} rowCount={10} />}
        >
          <UserListingPage />
        </Suspense>
      </div>
    </PageContainer>
  );
}
