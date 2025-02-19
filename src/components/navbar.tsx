import Image from 'next/image';
import { redirect } from 'next/navigation';
import { MainNav } from './main-nav';
import { MobileNav } from './mobile-nav';
import { ThemeToggle } from '@/components/theme-toggle';
import { UserButton } from '@/components/auth/user-button';
import LabSwitcher from './lab-switcher';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { BeakerIcon, SparklesIcon } from '@heroicons/react/24/solid';
import { ServerStatusButton } from './server-status-button';
import { cn } from '@/lib/utils';

interface NavbarProps {
  user: any;
}

const Navbar = async ({ user }: NavbarProps) => {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const labs = await db.labaratory.findMany({ where: { userId: session.user.id } });

  return (
    <nav className={cn(
      "z-50",
      "h-16 border-b",
      "bg-white/80 dark:bg-gray-900/80",
      "backdrop-blur-md",
    )}>
      <div className="h-full px-4 flex items-center justify-between">
        <NavbarLeft labs={labs} />
        <MainNav className="hidden lg:flex mx-6" />
        <NavbarRight labs={labs} user={user} />
      </div>
    </nav>
  );
};

const NavbarLeft = ({ labs }: { labs: any }) => (
  <div className="flex items-center space-x-4">
    <LabSwitcher items={labs} className="hidden lg:flex" />
  </div>
);


const NavbarRight = ({ labs, user }: { labs: any, user: any }) => (
  <div className="flex items-center gap-2">
    <ServerStatusButton className="hidden sm:flex" />
    <UserButton user={user} className="block" showThemeToggle />
    <ThemeToggle className="hidden md:flex" />
    <BeakerIcon className="h-6 w-6 text-[#C9121F] animate-bounce hidden sm:block" />
    <MobileNav labs={labs} className="md:hidden" />
  </div>
);

export default Navbar;
