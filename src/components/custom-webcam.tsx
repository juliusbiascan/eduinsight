"use client"

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown, Trash, Camera, RefreshCw } from 'lucide-react';
import Image from 'next/image';
import Webcam from 'react-webcam';
import { Popover, PopoverContent, PopoverTrigger } from '@radix-ui/react-popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';
import { cn } from '@/lib/utils';

interface CustomWebcamProps {
  disabled?: boolean;
  onSave: (value: string) => void;
  onRemove: () => void;
  value: string;
}

const CustomWebcam: React.FC<CustomWebcamProps> = ({
  disabled,
  onSave,
  onRemove,
  value
}) => {

  const webcamRef = useRef<Webcam>(null);

  const [open, setOpen] = useState(false)

  const [deviceId, setDeviceId] = useState('');

  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);

  const handleDevices = useCallback(
    (mediaDevices: MediaDeviceInfo[]) =>
      setDevices(mediaDevices.filter(({ kind }) => kind === "videoinput")),
    [setDevices]
  );

  useEffect(
    () => {
      navigator.mediaDevices.enumerateDevices().then(handleDevices);
    },
    [handleDevices]
  );

  const [isMounted, setIsMounted] = useState(false);

  const retake = () => {
    onRemove();
  };

  const capture = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      onSave(imageSrc);
    }

  }

  useEffect(() => {
    setIsMounted(true);
  }, [])


  if (!isMounted) {
    return null;
  }

  return (
    <div className='space-y-4 bg-gradient-to-br from-pink-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-6 rounded-xl shadow-lg'>
      <div className='relative w-full h-[300px] rounded-lg overflow-hidden border-4 border-pink-300 dark:border-pink-700'>
        {value ? (
          <>
            <div className='absolute top-2 right-2 z-10'>
              <Button type='button' onClick={retake} variant="secondary" size="sm" className="mr-2">
                <RefreshCw className='w-4 h-4 mr-1' /> Retake
              </Button>
              <Button type='button' onClick={onRemove} variant="destructive" size="sm">
                <Trash className='w-4 h-4 mr-1' /> Remove
              </Button>
            </div>
            <Image fill className='object-cover' alt='Profile Image' src={value} />
          </>
        ) : (
          <Webcam
            height={300}
            width={400}
            ref={webcamRef}
            mirrored={true}
            screenshotFormat="image/jpeg"
            screenshotQuality={0.8}
            videoConstraints={{ deviceId: deviceId }}
            className="rounded-lg w-full h-full object-cover"
          />
        )}
      </div>
      {!value && (
        <div className='space-y-2'>
          <Button
            disabled={disabled}
            variant='default'
            onClick={capture}
            className="w-full bg-gradient-to-r from-pink-400 to-blue-400 hover:from-pink-500 hover:to-blue-500"
          >
            <Camera className="w-4 h-4 mr-2" /> Capture Photo
          </Button>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between"
              >
                {deviceId
                  ? devices.find((device) => device.deviceId === deviceId)?.label
                  : "Select webcam..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
              <Command>
                <CommandInput placeholder="Search webcam..." />
                <CommandEmpty>No webcam found.</CommandEmpty>
                <CommandGroup>
                  <CommandList>
                    {devices.map((device) => (
                      <CommandItem
                        key={device.deviceId}
                        value={device.deviceId}
                        onSelect={(currentValue) => {
                          setDeviceId(currentValue === deviceId ? "" : currentValue)
                          setOpen(false)
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            deviceId === device.deviceId ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {device.label}
                      </CommandItem>
                    ))}
                  </CommandList>
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  )
};

export default CustomWebcam
