"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, usePathname } from "next/navigation"
import { HamburgerMenuIcon } from "@radix-ui/react-icons"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import LabSwitcher from "./lab-switcher"
import { siteConfig } from "@/config/site"

interface MobileNavProps {
  labs: any;
  className?: string;
}

export const MobileNav = ({ labs, className }: MobileNavProps) => {
  const [open, setOpen] = React.useState(false)
  const pathname = usePathname();
  const params = useParams();

  const routes = [
    {
      href: `/${params.labId}`,
      label: 'Overview',
      active: pathname === `/${params.labId}`,
    },
    {
      href: `/${params.labId}/monitoring`,
      label: 'Monitoring',
      active: pathname === `/${params.labId}/monitoring`,
    },
    {
      href: `/${params.labId}/devices`,
      label: 'Devices',
      active: pathname === `/${params.labId}/devices`,
    },
    {
      href: `/${params.labId}/users`,
      label: 'Users',
      active: pathname === `/${params.labId}/users`,
    },
    {
      href: `/${params.labId}/settings`,
      label: 'Settings',
      active: pathname === `/${params.labId}/settings`,
    },
  ]

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0",
            className
          )}
        >
          <HamburgerMenuIcon className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full sm:w-[300px] p-0 bg-[#EAEAEB] dark:bg-[#1A1617]">
        <div className="px-4 py-3 border-b">
          <Link
            href="/"
            className="flex items-center"
            onClick={() => setOpen(false)}
          >
            <HamburgerMenuIcon className="mr-2 h-4 w-4" />
            <span className="font-bold text-[#C9121F] dark:text-[#EBC42E]">{siteConfig.name}</span>
          </Link>
        </div>
        <ScrollArea className="h-[calc(100vh-4rem)] px-4">
          <div className="my-4 w-full">
            <LabSwitcher items={labs} className="w-full" />
          </div>
          <div className="flex flex-col space-y-2">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'w-full px-4 py-3 rounded-md text-sm font-medium transition-colors',
                  route.active
                    ? 'bg-[#C9121F] text-white dark:bg-[#EBC42E] dark:text-[#1A1617]'
                    : 'hover:bg-[#C9121F] hover:text-white dark:hover:bg-[#EBC42E] dark:hover:text-[#1A1617]'
                )}
              >
                {route.label}
              </Link>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}