"use client";

import * as React from "react";
import { Check, ChevronsUpDown, BeakerIcon, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
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
import { motion } from "framer-motion";
import { useTheme } from 'next-themes';

type PopoverTriggerProps = React.ComponentPropsWithoutRef<typeof PopoverTrigger>;

interface LabSwitcherProps extends PopoverTriggerProps {
  items: Record<string, any>[];
}

export default function LabSwitcher({ className, items = [] }: LabSwitcherProps) {
  const labModal = useLabModal();
  const params = useParams();
  const router = useRouter();

  const formattedItems = items.map((item) => ({
    label: item.name,
    value: item.id
  }));

  const currentLab = formattedItems.find((item) => item.value === params.labId);

  const [open, setOpen] = React.useState(false);

  const onLabSelect = (lab: { value: string, label: string }) => {
    setOpen(false);
    router.push(`/${lab.value}`);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="lg"
          role="combobox"
          aria-expanded={open}
          aria-label="Select a lab"
          className={cn(
            "w-[300px] justify-between transition-all duration-200 ease-in-out",
            "bg-[#EAEAEB] dark:bg-[#1A1617] border-none",
            "text-[#1A1617] dark:text-[#EAEAEB]",
            "hover:bg-[#C9121F] hover:text-white dark:hover:bg-[#EBC42E] dark:hover:text-[#1A1617]",
            className
          )}
        >
          <div className="flex items-center">
            <BeakerIcon className="h-5 w-5 mr-3" />
            <span className="text-sm font-medium">
              {currentLab?.label || "Select Lab"}
            </span>
          </div>
          <ChevronsUpDown className="h-5 w-5 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-1 bg-[#EAEAEB] dark:bg-[#1A1617] border-none">
        <Command className="bg-transparent">
          <CommandInput placeholder="Search lab..." className="h-11" />
          <CommandList>
            <CommandEmpty>No lab found.</CommandEmpty>
            <CommandGroup heading="Laboratories">
              {formattedItems.map((lab) => (
                <CommandItem
                  key={lab.value}
                  onSelect={() => onLabSelect(lab)}
                  className={cn(
                    "px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ease-in-out",
                    "text-[#1A1617] dark:text-[#EAEAEB]",
                    "hover:bg-[#C9121F] hover:text-white dark:hover:bg-[#EBC42E] dark:hover:text-[#1A1617]",
                    currentLab?.value === lab.value && "bg-[#C9121F] text-white dark:bg-[#EBC42E] dark:text-[#1A1617]"
                  )}
                >
                  <BeakerIcon className="h-5 w-5 mr-3" />
                  {lab.label}
                  {currentLab?.value === lab.value && (
                    <Check className="ml-auto h-5 w-5" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator className="bg-gray-200 dark:bg-gray-700" />
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  setOpen(false);
                  labModal.onOpen();
                }}
                className="px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ease-in-out
                text-[#1A1617] dark:text-[#EAEAEB]
                hover:bg-[#C9121F] hover:text-white dark:hover:bg-[#EBC42E] dark:hover:text-[#1A1617]"
              >
                <PlusCircle className="h-5 w-5 mr-3" />
                Create New Lab
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
