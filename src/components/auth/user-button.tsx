"use client"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"

import {
  Cloud,
  CreditCard,
  Github,
  Keyboard,
  LifeBuoy,
  LogOut,
  Mail,
  MessageSquare,
  Plus,
  PlusCircle,
  Settings,
  UserPlus,
  Users,
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Button } from "@/components/ui/button"
import { useParams, useRouter } from "next/navigation"
import { LogoutButton } from "./logout-button"
import { User } from "@prisma/client"
import { cn } from "@/lib/utils"
import { ThemeToggle } from '@/components/theme-toggle';
import { useSession } from "next-auth/react"

interface UserButtonProps {
  className?: string;
  showThemeToggle?: boolean;
}

export const UserButton = ({ className, showThemeToggle }: UserButtonProps) => {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter()

  if (session) {
    return (

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "w-8 h-8 sm:w-10 sm:h-10 rounded-full p-0 hover:bg-[#C9121F]/10",
              className
            )}
          >
            <Avatar className="h-7 w-7 sm:h-9 sm:w-9 border-2 border-[#C9121F]/20 transition-all hover:border-[#C9121F]">
              <AvatarImage
                className="object-cover"
                alt="@profile"
                src={session.user?.image || ""}
              />
              <AvatarFallback>
                {(session.user?.name || "")[0]}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-[280px] sm:w-56 rounded-xl border-2 border-[#C9121F]/10"
          align="end"
          forceMount
        >
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{session.user?.name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {session.user?.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {showThemeToggle && (
              <>
                <DropdownMenuItem className="lg:hidden">
                  <ThemeToggle variant="menu" />
                </DropdownMenuItem>
                <DropdownMenuSeparator className="lg:hidden" />
              </>
            )}
            <DropdownMenuItem onClick={() => router.push(`/${params.labId}/account`)}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
              <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
            </DropdownMenuItem>

          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Github className="mr-2 h-4 w-4" />
            <span>GitHub</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <LifeBuoy className="mr-2 h-4 w-4" />
            <span>Support</span>
          </DropdownMenuItem>
          <DropdownMenuItem disabled>
            <Cloud className="mr-2 h-4 w-4" />
            <span>API</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <LogoutButton>
            <DropdownMenuItem
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
              <DropdownMenuShortcut>⌘+Q</DropdownMenuShortcut>
            </DropdownMenuItem>
          </LogoutButton>

        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
}