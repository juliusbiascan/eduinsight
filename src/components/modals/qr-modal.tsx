"use client";

import { useEffect, useState } from "react";

import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useQRCode } from 'next-qrcode';
import { RegistrationColumn } from "@/app/admin/[labId]/(routes)/registration/components/columns";

interface QRModalProps {
  isOpen: boolean;
  data: RegistrationColumn;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}

export const QRModal: React.FC<QRModalProps> = ({
  data,
  isOpen,
  onClose,
  onConfirm,
  loading
}) => {

  const { Canvas } = useQRCode();

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <Modal
      title="Generated QR Code"
      description="This action cannot be undone."
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="grid grid-cols-2 gap-8">
        {isOpen &&
          <Canvas
            text={data?.id}
            options={{
              errorCorrectionLevel: 'M',
              margin: 3,
              scale: 4,
              width: 200,
              color: {
                dark: '#000000',
                light: '#FFFFFF',
              },
            }}
          />}
      </div>
      <div className="pt-6 space-x-2 flex items-center justify-end w-full">
        <Button disabled={loading} variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button disabled={loading} variant="secondary" onClick={onConfirm}>Print</Button>
      </div>
    </Modal>
  );
};
