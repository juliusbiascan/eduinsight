"use client";

import React, { useCallback, useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, LogIn, LogOut, Loader2 } from "lucide-react";
import { cn } from '@/lib/utils';
import { ClockInSchema } from "@/schemas";
import { clockIn } from "@/actions/clock-in";
import { getAllDevice } from "@/data/device";
import { getActiveDeviceUserByUserId, getDeviceUserBySchoolId } from "@/data/user";
import { getUserState } from "@/actions/staff";
import toast from "react-hot-toast";
import { Device, DeviceUser } from "@prisma/client";
import { useSocket } from "@/providers/socket-provider";

interface ClockInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (error: string | undefined, success: string | undefined) => void;
  loading: boolean;
  userId: string;
}

export const ClockInModal: React.FC<ClockInModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  loading,
  userId,
}) => {

  const router = useRouter();
  const [user, setUser] = useState<DeviceUser>();
  const [state, setState] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [isPending, startTransition] = useTransition();
  const [isMounted, setIsMounted] = useState(false);
  const [open, setOpen] = useState(false)
  const [deviceId, setDeviceId] = useState('');
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    setIsMounted(true);
    const fetch = async () => {

      const user = await getDeviceUserBySchoolId(userId);

      if (!user) {
        toast.error("User not found!")
        return
      }

      setUser(user);

      const state = await getUserState(user.id);
      setState(state == 1);

      const devices = await getAllDevice(user.labId);
      if (devices) {
        setDevices([...devices])
        if (devices.length !== 0)
          setDeviceId(devices[0].id)
      }
      if (socket)
        socket.emit("join-server", deviceId);
    }
    if (userId)
      fetch()
  }, [userId, deviceId, socket]);

  const emitEvent = useCallback((eventName: string, data: any) => {
    if (socket) {
      socket.emit(eventName, { deviceId: deviceId, ...data });
    }
  }, [deviceId, socket]);

  if (!isMounted) {
    return null;
  }

  const onSubmit = async (user: DeviceUser) => {
    const userId = user.id;
    if (!user || !deviceId) {
      toast.error("User or Device not found!");
      return;
    }

    const activeDeviceUser = await getActiveDeviceUserByUserId(userId);

    const val: z.infer<typeof ClockInSchema> = {
      userId: userId,
      deviceId: !activeDeviceUser ? deviceId : activeDeviceUser?.deviceId,
    };

    startTransition(() => {
      if (socket) clockIn(val)
        .then((data) => {

          if (data && 'state' in data) {
            if (data.state === 'login') {
              const deviceId = data.deviceId;
              const userId = data.userId;
              const labId = data.labId;
              emitEvent('login-user', { deviceId: deviceId, userId: userId });
            } else if (data.state === 'logout') {
              const deviceId = data.deviceId;
              const userId = data.userId;
              const labId = data.labId;
              emitEvent('logout-user', { deviceId: deviceId, userId: userId, labId: labId });
            }
          }
          if (data && 'error' in data) {
            onConfirm(data.error as string, undefined);
          } else if (data && 'success' in data) {
            onConfirm(undefined, data.success as string);
          }
          router.refresh();
        });
    });
  };

  return (
    <>
      {user && (
        <Modal
          title="Clock In/Out Confirmation"
          description="Please confirm your action."
          isOpen={isOpen}
          onClose={onClose}
        >
          <div className="flex flex-col items-center space-y-4">
           
            <h5 className="text-xl font-medium text-gray-900 dark:text-white">
              {user.firstName} {user.lastName}
            </h5>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {user.role}
            </p>


            {!state && devices.length > 0 && (
              <Popover
                open={open}
                onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    className="w-full"
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={!isConnected}
                  >
                    {deviceId
                      ? devices.find((device) => device.id === deviceId)?.name
                      : "Select device..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <Command>
                    <CommandInput placeholder="Search device..." />
                    <CommandEmpty>No device found.</CommandEmpty>
                    <CommandGroup>
                      <CommandList>
                        {devices.map((device, key) => (
                          <CommandItem
                            key={key}
                            value={device.id}
                            onSelect={(currentValue) => {
                              setDeviceId(currentValue === deviceId ? "" : currentValue)
                              setOpen(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                deviceId === device.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {device.name}
                          </CommandItem>
                        ))}
                      </CommandList>
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            )}

            {!state && devices.length === 0 && (
              <p className="text-sm text-red-500">No Available Devices</p>
            )}

            <div className="flex space-x-2 w-full">
              <Button
                className="flex-1"
                variant="outline"
                onClick={onClose}
                disabled={loading || isPending || !isConnected}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                variant={state ? "destructive" : "default"}
                onClick={() => onSubmit(user)}
                disabled={loading || isPending || (!state && devices.length === 0) || !isConnected}
              >
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : state ? (
                  <>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                  </>
                )}
                {isPending ? 'Processing...' : (state ? 'Logout' : 'Login')}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
