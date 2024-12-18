"use client"

import * as React from "react"
import Link, { LinkProps } from "next/link"
import { useParams, usePathname, useRouter } from "next/navigation"
import { HamburgerMenuIcon } from "@radix-ui/react-icons"

import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface MobileNavProps {
  children: React.ReactNode
}

export const MobileNav: React.FC<MobileNavProps> = ({ children }) => {

  const [open, setOpen] = React.useState(false)
  const pathname = usePathname();
  const params = useParams();

  const routes = [
    {
      href: `/admin/${params.labId}`,
      label: 'Overview',
      active: pathname === `/admin/${params.labId}`,
    },
    {
      href: `/admin/${params.labId}/devices`,
      label: 'Devices',
      active: pathname === `/admin/${params.labId}/devices`,
    },
    {
      href: `/admin/${params.labId}/monitoring`,
      label: 'Monitoring',
      active: pathname === `/admin/${params.labId}/monitoring`,
    },
    {
      href: `/admin/${params.labId}/registration`,
      label: 'Users',
      active: pathname === `/admin/${params.labId}/registration`,
    },
    {
      href: `/admin/${params.labId}/settings`,
      label: 'Settings',
      active: pathname === `/admin/${params.labId}/settings`,
    },
  ]

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
        >
          <HamburgerMenuIcon className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0 bg-[#EAEAEB] dark:bg-[#1A1617]">
        <MobileLink
          href="/"
          className="flex items-center"
          onOpenChange={setOpen}
        >
          <HamburgerMenuIcon className="mr-2 h-4 w-4" />
          <span className="font-bold text-[#C9121F] dark:text-[#EBC42E]">{siteConfig.name}</span>
        </MobileLink>
        <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
          <div className="flex flex-col space-y-3">
            {routes.map(
              (item) =>
                item.href && (
                  <MobileLink
                    key={item.href}
                    href={item.href}
                    onOpenChange={setOpen}
                    className="text-[#1A1617] dark:text-[#EAEAEB]"
                  >
                    {item.label}
                  </MobileLink>
                )
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

interface MobileLinkProps extends LinkProps {
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
  className?: string
}

function MobileLink({
  href,
  onOpenChange,
  className,
  children,
  ...props
}: MobileLinkProps) {
  const router = useRouter()
  return (
    <Link
      href={href}
      onClick={() => {
        router.push(href.toString())
        onOpenChange?.(false)
      }}
      className={cn(className)}
      {...props}
    >
      {children}
    </Link>
  )
}