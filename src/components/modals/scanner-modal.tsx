"use client";

import { useCallback, useEffect, useState } from "react";

import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { IDetectedBarcode, Scanner, useDevices } from "@yudiel/react-qr-scanner";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
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
interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResult: (value: string) => void;
  loading: boolean;
}

export const ScannerModal: React.FC<ScannerModalProps> = ({
  isOpen,
  onClose,
  onResult,
  loading
}) => {

  const deviceList = useDevices();
  const [value, setValue] = useState("")
  const [open, setOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  const handleScan = (text: string) => {
    onResult(text);
  }

  return (
    <Modal
      title="QR Scanner"
      description="Tips: Make sure the you have good lightning"
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

        {isOpen && <Scanner
          formats={[
            'qr_code',
            'micro_qr_code',
            'rm_qr_code',
            'maxi_code',
            'pdf417',
            'aztec',
            'data_matrix',
            'matrix_codes',
            'dx_film_edge',
            'databar',
            'databar_expanded',
            'codabar',
            'code_39',
            'code_93',
            'code_128',
            'ean_8',
            'ean_13',
            'itf',
            'linear_codes',
            'upc_a',
            'upc_e'
          ]}
          components={{
            audio: true,
            onOff: true,
            torch: true,
          }}
          allowMultiple={true}
          scanDelay={2000}
          onScan={(detectedCodes: IDetectedBarcode[]) => {
            detectedCodes.map((detectedCode) => {
              handleScan(detectedCode.rawValue);
            })
          }}
          constraints={{
            deviceId: value
          }}
        />}

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              {value
                ? deviceList?.find((deviceList) => deviceList.deviceId === value)?.label
                : "Select webcam..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="Search webcam..." />
              <CommandEmpty>No webcam found.</CommandEmpty>
              <CommandGroup>
                <CommandList>
                  {deviceList?.map((deviceList) => (
                    <CommandItem
                      key={deviceList.deviceId}
                      value={deviceList.deviceId}
                      onSelect={(currentValue) => {
                        setValue(currentValue === value ? "" : currentValue)
                        setOpen(false)
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === deviceList.deviceId ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {deviceList.label}
                    </CommandItem>
                  ))}
                </CommandList>
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </Modal>
  );
};
