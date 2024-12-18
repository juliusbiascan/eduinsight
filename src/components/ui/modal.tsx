"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTheme } from "next-themes";

interface ModalProps {
  title: string;
  description: string;
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  title,
  description,
  isOpen,
  onClose,
  children
}) => {
  const { theme } = useTheme();

  const onChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onChange}>
      <DialogContent className={`
        sm:max-w-[425px] 
        ${theme === 'dark'
          ? 'bg-gray-800'
          : 'bg-white'
        } 
        rounded-lg shadow-md
        transition-all duration-300
      `}>
        <DialogHeader className="space-y-2">
          <DialogTitle className={`
            text-xl font-bold flex items-center
            ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
          `}>
            {title}
          </DialogTitle>
          <DialogDescription className={`
            text-sm 
            ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}
          `}>
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className={`
          mt-4
          ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}
        `}>
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
};
