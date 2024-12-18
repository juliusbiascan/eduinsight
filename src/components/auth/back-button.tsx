"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";

interface BackButtonProps {
  href: string;
  label: string;
  className?: string;
}

export const BackButton = ({
  href,
  label,
  className,
}: BackButtonProps) => {
  return (
    <Button
      variant="link"
      className={`font-normal ${className}`}
      size="sm"
      asChild
    >
      <Link href={href}>
        {label}
      </Link>
    </Button>
  );
};
