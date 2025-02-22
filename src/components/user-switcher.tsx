'use client';

import * as React from "react";
import { Check, ChevronsUpDown, UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getAllDeviceUsers } from '@/data/user';
import { useParams, useRouter } from 'next/navigation';
import { DeviceUser } from '@prisma/client';
import { Skeleton } from "@/components/ui/skeleton";

export function UserSwitcher() {
  const params = useParams();
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [users, setUsers] = React.useState<Partial<DeviceUser>[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchUsers = async () => {
      if (params.labId) {
        setLoading(true);
        try {
          const fetchedUsers = await getAllDeviceUsers();
          setUsers(fetchedUsers);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchUsers();
  }, [params.labId]);

  const formattedUsers = users.map((user) => ({
    label: `${user.firstName} ${user.lastName}`,
    value: user.id!
  }));

  const currentUser = formattedUsers.find((user) => user.value === params.userId);

  const onUserSelect = (user: { value: string, label: string }) => {
    setOpen(false);
    router.push(`/${params.labId}/users/${user.value}/logs`);
  };

  if (loading) {
    return <Skeleton className="h-8 w-[120px]" />;
  }

  if (!users.length) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-auto p-1 flex items-center gap-1 font-normal"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <UserIcon className="h-4 w-4" />
          <span>{currentUser?.label || "Select User"}</span>
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-1" onClick={(e) => e.stopPropagation()}>
        <Command>
          <CommandInput placeholder="Search user..." />
          <CommandList>
            <CommandEmpty>No user found.</CommandEmpty>
            <CommandGroup>
              {formattedUsers.map((user) => (
                <CommandItem
                  key={user.value}
                  onSelect={() => onUserSelect(user)}
                >
                  <UserIcon className="h-4 w-4 mr-2" />
                  {user.label}
                  {currentUser?.value === user.value && (
                    <Check className="ml-auto h-4 w-4" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
