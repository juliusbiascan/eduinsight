import { CheckCircledIcon } from "@radix-ui/react-icons";
import { Card, CardContent } from "@/components/ui/card";

interface FormSuccessProps {
  message?: string;
};

export const FormSuccess = ({
  message,
}: FormSuccessProps) => {
  if (!message) return null;

  return (
    <Card className="bg-green-50 border border-green-200 text-green-800 rounded-md shadow-sm">
      <CardContent className="flex items-center p-4">
        <CheckCircledIcon className="h-5 w-5 mr-3 text-green-400" />
        <span className="text-sm font-medium">{message}</span>
      </CardContent>
    </Card>
  );
};
