"use client"
import { Copy, Server } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./alert";
import { Badge, BadgeProps } from "./badge";
import { Button } from "./button";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

interface ApiAlertProps {
  title: string;
  description: string;
  variant: 'public' | 'admin';
}

const textMap: Record<ApiAlertProps["variant"], string> = {
  public: 'Public',
  admin: 'Admin'
}
const variantMap: Record<ApiAlertProps["variant"], BadgeProps['variant']> = {
  public: 'secondary',
  admin: 'destructive'
}

export const ApiAlert: React.FC<ApiAlertProps> = ({
  title,
  description,
  variant = 'public'
}) => {
  const onCopy = () => {
    navigator.clipboard.writeText(description);
    toast.success("API Route copied to the clipboard", {
      icon: '🎉',
      style: {
        borderRadius: '10px',
        background: '#1A1617',
        color: '#fff',
      },
    });
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Alert className="bg-[#EAEAEB] dark:bg-[#1A1617] backdrop-blur supports-[backdrop-filter]:bg-opacity-60 border-2 border-[#C9121F] dark:border-[#C9121F] rounded-lg shadow-lg">
        <Server className="w-6 h-6 text-[#C9121F]" />
        <AlertTitle className="flex items-center gap-x-2 text-lg font-bold text-black dark:text-white">
          {title}
          <Badge variant={variantMap[variant]} className="ml-2">
            {textMap[variant]}
          </Badge>
        </AlertTitle>
        <AlertDescription className="mt-4">
          <div className="flex items-center justify-between bg-white/80 dark:bg-gray-800/80 rounded-md p-2">
            <code className="text-sm font-mono font-semibold text-[#C9121F] dark:text-[#C9121F]">
              {description}
            </code>
            <Button
              variant='outline'
              size="sm"
              onClick={onCopy}
              className="ml-2 hover:bg-gray-100 dark:hover:bg-gray-700 border-[#C9121F] text-[#C9121F]"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </motion.div>
  )
}