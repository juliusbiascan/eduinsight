import { Info } from "lucide-react";

interface HintTextProps {
  children: React.ReactNode;
}

export const HintText = ({ children }: HintTextProps) => {
  return (
    <div className="flex items-start gap-2 mt-2 text-muted-foreground text-sm">
      <Info className="h-4 w-4 mt-0.5" />
      <div>{children}</div>
    </div>
  );
};
