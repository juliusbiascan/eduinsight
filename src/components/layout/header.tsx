import React from 'react';
import { SidebarTrigger } from '../ui/sidebar';
import { Separator } from '../ui/separator';


import { Breadcrumbs } from '../breadcrumbs';
import { ThemeToggle } from '../theme-toggle';
import { UserButton } from '../auth/user-button';
import SearchInput from '../search';
import { ServerStatusButton } from '../server-status-button';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';

export default async function Header() {
  
  const session = await auth();

  if (!session) redirect("/auth/login");

  const labs = await db.labaratory.findMany({ where: { userId: session.user.id } });

  return (
    <header className='flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12'>
      <div className='flex items-center gap-2 px-4'>
        <SidebarTrigger className='-ml-1' />
        <Separator orientation='vertical' className='mr-2 h-4' />
        <Breadcrumbs labs={labs} />
      </div>

      <div className='flex items-center gap-2 px-4'>
        <div className='hidden md:flex'>
          <SearchInput />
        </div>
        <ServerStatusButton className="hidden sm:flex" />
        <UserButton />
        <ThemeToggle />
        
      </div>
    </header>
  );
}
