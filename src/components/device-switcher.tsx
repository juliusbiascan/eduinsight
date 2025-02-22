'use client';

import * as React from "react";
import { Check, ChevronsUpDown, MonitorIcon } from "lucide-react";
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
import { getAllDevices } from '@/data/device';
import { useParams, useRouter } from 'next/navigation';
import { Device } from '@prisma/client';
import { Skeleton } from "@/components/ui/skeleton";

export function DeviceSwitcher() {
    const params = useParams();
    const router = useRouter();
    const [open, setOpen] = React.useState(false);
    const [devices, setDevices] = React.useState<Device[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchDevices = async () => {
            if (params.labId) {
                setLoading(true);
                try {
                    const fetchedDevices = await getAllDevices(params.labId as string);
                    if (fetchedDevices)
                        setDevices(fetchedDevices);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchDevices();
    }, [params.labId]);

    const formattedDevices = devices.map((device) => ({
        label: device.name || device.id,
        value: device.id!
    }));

    const currentDevice = formattedDevices.find((device) => device.value === params.devId);

    const onDeviceSelect = (device: { value: string, label: string }) => {
        setOpen(false);
        router.push(`/${params.labId}/monitoring/${device.value}/activitylogs`);
    };

    if (loading) {
        return <Skeleton className="h-8 w-[120px]" />;
    }

    if (!devices.length) return null;

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
                    <MonitorIcon className="h-4 w-4" />
                    <span>{currentDevice?.label || "Select Device"}</span>
                    <ChevronsUpDown className="h-4 w-4 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-1" onClick={(e) => e.stopPropagation()}>
                <Command>
                    <CommandInput placeholder="Search device..." />
                    <CommandList>
                        <CommandEmpty>No device found.</CommandEmpty>
                        <CommandGroup>
                            {formattedDevices.map((device) => (
                                <CommandItem
                                    key={device.value}
                                    onSelect={() => onDeviceSelect(device)}
                                >
                                    <MonitorIcon className="h-4 w-4 mr-2" />
                                    {device.label}
                                    {currentDevice?.value === device.value && (
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
