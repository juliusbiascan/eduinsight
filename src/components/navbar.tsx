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

interface NavbarProps {
  user: any;
}

const Navbar = async ({ user }: NavbarProps) => {
  const session = await auth();
  if (!session) redirect("/auth/login");

  const labs = await db.labaratory.findMany({ where: { userId: session.user.id } });

  return (
    <nav className="sticky top-0 z-50 border-b bg-[#EAEAEB] dark:bg-[#1A1617] backdrop-blur supports-[backdrop-filter]:bg-opacity-60">
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          <NavbarLeft labs={labs} />
          <MainNav className="hidden lg:flex mx-6" />
          <NavbarRight labs={labs} user={user} />
        </div>
      </div>
    </nav>
  );
};

const NavbarLeft = ({ labs }: { labs: any }) => (
  <div className="flex items-center space-x-4">
    <LogoWithSparkle />
    <LabSwitcher items={labs} className="hidden lg:flex" />
  </div>
);

const LogoWithSparkle = () => (
  <div className="relative">
    <Image
      src="/passlogo-small.png"
      alt="SMNHS Logo"
      width={56}
      height={56}
      className="rounded-full border-2 border-[#C9121F] shadow-md"
    />
    <SparklesIcon className="absolute -top-1 -right-1 h-5 w-5 text-[#EBC42E] animate-pulse" />
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
