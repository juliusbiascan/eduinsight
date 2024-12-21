"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader
} from "@/components/ui/card";
import { Header } from "@/components/auth/header";
import { Social } from "@/components/auth/social";
import { BackButton } from "@/components/auth/back-button";

interface CardWrapperProps {
  children: React.ReactNode;
  headerLabel: string;
  headerComponent?: React.ReactNode;
  showSocial?: boolean;
  backButtonLabel: string
  backButtonHref: string
};

export const CardWrapper = ({
  children,
  headerLabel,
  headerComponent,
  showSocial,
  backButtonLabel,
  backButtonHref,
}: CardWrapperProps) => {
  return (
    <Card className="w-[400px] shadow-xl rounded-2xl overflow-hidden border-2 border-[#C9121F]/10 bg-white/95 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl">
      <CardHeader className="space-y-3 bg-gradient-to-b from-white to-gray-50 p-6">
        {headerComponent || <Header label={headerLabel} />}
      </CardHeader>
      <CardContent className="p-6">
        {children}
      </CardContent>
      {showSocial && (
        <CardFooter className="bg-gray-50/50 p-4 border-t border-gray-100">
          <Social />
        </CardFooter>
      )}
        <CardFooter>
        <BackButton 
          label={backButtonLabel}
          href={backButtonHref}
        />
      </CardFooter>
    </Card>
  );
};
