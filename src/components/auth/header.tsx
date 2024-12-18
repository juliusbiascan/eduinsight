import { Poppins } from "next/font/google";
import Image from "next/image";
import { cn } from "@/lib/utils";

const font = Poppins({
  subsets: ["latin"],
  weight: ["600"],
});

interface HeaderProps {
  label: string;
  className?: string;
}

export const Header = ({
  label,
  className,
}: HeaderProps) => {
  return (
    <div className={cn("w-full flex flex-col gap-y-4 items-center justify-center", className)}>
      <div className="flex items-center space-x-2">
        <Image
          src="/passlogo-small.png"
          alt="PASS Logo"
          width={48}
          height={48}
          className="rounded-full border-2 border-yellow-400"
        />
        <h1 className={cn(
          "text-3xl font-bold bg-gradient-to-r from-yellow-500 via-red-500 to-black text-transparent bg-clip-text",
          font.className,
        )}>
          EduInsight
        </h1>
      </div>
      <p className="text-muted-foreground text-sm">
        {label}
      </p>
    </div>
  );
};
