import Image from 'next/image';
import { redirect } from 'next/navigation';
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
        <div className="flex items-center space-x-4">
          <LabSwitcher items={labs} />
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserButton />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
