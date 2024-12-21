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
      <div className="flex items-center space-x-3">
        <Image
          src="/passlogo-small.png"
          alt="PASS Logo"
          width={48}
          height={48}
          className="rounded-full border-2 border-[#C9121F] shadow-md"
        />
        <h1 className={cn(
          "text-3xl font-bold bg-gradient-to-r from-[#C9121F] to-[#1A1617] text-transparent bg-clip-text",
          font.className,
        )}>
          EduInsight
        </h1>
      </div>
      <p className="text-gray-500 text-sm">
        {label}
      </p>
    </div>
  );
};
