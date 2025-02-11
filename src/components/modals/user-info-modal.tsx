"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

interface UserInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  userInfo?: {
    schoolId: string;
    firstName: string;
    lastName: string;
    password: string;
  };
}

export const UserInfoModal = ({
  isOpen,
  onClose,
  userInfo
}: UserInfoModalProps) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!userInfo) return null;

  const infoItems = [
    { label: "School ID", value: userInfo.schoolId },
    { label: "Name", value: `${userInfo.firstName} ${userInfo.lastName}` },
    { label: "Initial Password", value: userInfo.password },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white dark:bg-zinc-900 p-6 max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-bold text-[#C9121F]">
            <Check className="w-6 h-6" />
            Registration Successful!
          </DialogTitle>
        </DialogHeader>

        <Card className="mt-4 border-2 border-gray-200 dark:border-gray-800">
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="border-b pb-2">
                <h3 className="text-lg font-semibold">Account Activation</h3>
                <p className="text-sm text-gray-500">Follow these steps to activate your account:</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm">1. Install EduInsight Client Software</p>
                <p className="text-sm">2. Launch the application</p>
                <p className="text-sm">3. Use your School ID to activate your account</p>
                <p className="text-sm">4. Complete your profile by adding email and contact number</p>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-md font-semibold mb-2">Your Credentials</h4>
                {infoItems.map((item, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between group p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800"
                  >
                    <div>
                      <p className="text-sm font-medium text-[#C9121F]">{item.label}</p>
                      <p className="text-base">{item.value}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(item.value)}
                      className="opacity-0 group-hover:opacity-100 transition"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {copied && (
          <div className="absolute bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-md">
            Copied to clipboard!
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <Button
            onClick={onClose}
            className="bg-[#C9121F] text-white hover:bg-red-700"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
