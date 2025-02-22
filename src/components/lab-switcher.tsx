"use client";

import * as React from "react";
import { Check, ChevronsUpDown, PlusCircle } from "lucide-react";
import { BeakerIcon } from '@heroicons/react/24/solid';
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useLabModal } from "@/hooks/use-lab-modal";
import { useParams, useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

interface LabSwitcherProps {
  items: Record<string, any>[];
  isLoading?: boolean;
}

export function LabSwitcher({ items = [], isLoading = false }: LabSwitcherProps) {
  const labModal = useLabModal();
  const params = useParams();
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  const formattedItems = items.map((item) => ({
    label: item.name,
    value: item.id
  }));

  const currentLab = formattedItems.find((item) => item.value === params.labId);

  const onLabSelect = (lab: { value: string, label: string }) => {
    setOpen(false);
    const currentPath = window.location.pathname;
    const newPath = currentPath.replace(/^\/[^\/]+/, `/${lab.value}`);
    router.push(newPath);
  };

  if (isLoading) {
    return <Skeleton className="h-8 w-[120px]" />;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-auto p-1 flex items-center gap-1 font-normal"
        >
           <BeakerIcon className="h-4 w-4 text-[#C9121F] animate-bounce hidden sm:block" />
          <span>{currentLab?.label || "Select Lab"}</span>
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-1">
        <Command>
          <CommandInput placeholder="Search lab..." />
          <CommandList>
            <CommandEmpty>No lab found.</CommandEmpty>
            <CommandGroup>
              {formattedItems.map((lab) => (
                <CommandItem
                  key={lab.value}
                  onSelect={() => onLabSelect(lab)}
                >
                  <BeakerIcon className="h-4 w-4 mr-2 text-[#C9121F] animate-bounce hidden sm:block" />
                  {lab.label}
                  {currentLab?.value === lab.value && (
                    <Check className="ml-auto h-4 w-4" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  setOpen(false);
                  labModal.onOpen();
                }}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Lab
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
