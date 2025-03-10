"use client"

import * as z from "zod"
import axios from "axios"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import { Trash, Beaker, Save, Copy, Check } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"
import { AlertModal } from "@/components/modals/alert-modal"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const formSchema = z.object({
  name: z.string().min(2),
  secretKey: z.string(),
});

type SettingsFormValues = z.infer<typeof formSchema>

interface SettingsFormProps {
  initialData: any
};

export const SettingsForm: React.FC<SettingsFormProps> = ({
  initialData
}) => {
  const params = useParams();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
  });

  const onSubmit = async (data: SettingsFormValues) => {
    try {
      setLoading(true);
      await axios.patch(`/api/labaratory/${params.labId}`, data);
      router.refresh();
      toast.success('Lab updated successfully! 🎉');
    } catch (error: any) {
      toast.error('Oops! Something went wrong. 😕');
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/labaratory/${params.labId}`);
      router.refresh();
      router.push('/');
      toast.success('Lab deleted successfully! 👋');
    } catch (error: any) {
      toast.error('Please remove all devices and staff first. 🧹');
    } finally {
      setLoading(false);
      setOpen(false);
    }
  }

  const onCopy = (value: string) => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  return (
    <div className="space-y-4">
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl font-semibold">Lab Information</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Update your laboratory details and settings</p>
            </div>
            <Button
              disabled={loading}
              variant="destructive"
              size="sm"
              onClick={() => setOpen(true)}
            >
              <Trash className="h-4 w-4 mr-2" />
              Delete Lab
            </Button>
          </div>
          <Separator className="mt-4" />
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lab Name</FormLabel>
                      <FormControl>
                        <Input
                          disabled={loading}
                          placeholder="Enter your lab name"
                          {...field}
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormItem>
                  <FormLabel>Secret Key</FormLabel>
                  <div className="relative">
                    <Input
                      disabled
                      value={initialData.secretKey}
                      className="w-full font-mono bg-muted/50 pr-12"
                    />
                    <Button
                      onClick={() => onCopy(initialData.secretKey)}
                      type="button"
                      variant="ghost"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-muted-foreground/5"
                    >
                      {copied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    This is your lab's secret key. Keep it safe and secure.
                  </p>
                </FormItem>
              </div>
              <div className="flex justify-end pt-4">
                <Button
                  disabled={loading}
                  type="submit"
                  className="w-full sm:w-auto"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};
