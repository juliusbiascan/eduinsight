import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { Card, CardContent } from "@/components/ui/card";

interface FormErrorProps {
  message?: string;
};

export const FormError = ({
  message,
}: FormErrorProps) => {
  if (!message) return null;

  return (
    <Card className="bg-red-50 border border-red-200 text-red-800 rounded-md shadow-sm">
      <CardContent className="flex items-center p-4">
        <ExclamationTriangleIcon className="h-5 w-5 mr-3 text-red-400" />
        <span className="text-sm font-medium">{message}</span>
      </CardContent>
    </Card>
  );
};
