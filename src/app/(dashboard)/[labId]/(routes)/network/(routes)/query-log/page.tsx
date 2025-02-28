import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { searchParamsCache } from '@/lib/searchparams';
import { Suspense } from 'react';
import QueryListingPage from './components/query-listing';
import QueryTableAction from './components/query-table-action';
import { SearchParams } from 'nuqs/server';

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
            title='Query Log'
            description='View and analyze DNS query logs'
          />
        </div>
        <Separator />
        <QueryTableAction />
        <Suspense
          key={key}
          fallback={<DataTableSkeleton columnCount={6} rowCount={10} />}
        >
          <QueryListingPage />
        </Suspense>
      </div>
    </PageContainer>
  );
}