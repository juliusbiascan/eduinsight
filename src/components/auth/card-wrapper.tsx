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
  backButtonLabel: string;
  backButtonHref: string;
  showSocial?: boolean;
};

export const CardWrapper = ({
  children,
  headerLabel,
  headerComponent,
  backButtonLabel,
  backButtonHref,
  showSocial
}: CardWrapperProps) => {
  return (
    <Card className="w-[400px] shadow-lg rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 transition-colors duration-300 ease-in-out">
      <CardHeader className="bg-white dark:bg-gray-800 p-6">
        {headerComponent || <Header label={headerLabel} className="text-xl font-semibold text-gray-800 dark:text-gray-200" />}
      </CardHeader>
      <CardContent className="p-6 bg-white dark:bg-gray-800">
        {children}
      </CardContent>
      {showSocial && (
        <CardFooter className="bg-gray-50 dark:bg-gray-700 p-4">
          <Social />
        </CardFooter>
      )}
      <CardFooter className="flex justify-between bg-gray-50 dark:bg-gray-700 p-4">
        <BackButton
          href={"/"}
          label={"Home"}
          className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
        />
        <BackButton
          label={backButtonLabel}
          href={backButtonHref}
          className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
        />
      </CardFooter>
    </Card>
  );
};
