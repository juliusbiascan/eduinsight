"use client";

import * as z from "zod"
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField, FormItem,
  FormLabel, FormMessage
} from "@/components/ui/form";
import { useLabModal } from "@/hooks/use-lab-modal";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { Beaker } from "lucide-react"; // Using Lucide icons to match dashboard

const formSchema = z.object({
  name: z.string().min(1),
});

export const LabModal = () => {
  const labModal = useLabModal();
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      const response = await axios.post('/api/labaratory', values);
      window.location.assign(`/admin/${response.data.userId}`);
    } catch (error) {
      console.log('Something went wrong', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Create Laboratory"
      description="Add a new laboratory to manage devices and staff."
      isOpen={labModal.isOpen}
      onClose={labModal.onClose}
    >
      <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex justify-center mb-6">
          <div className={`p-4 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <Beaker className="h-12 w-12" style={{ color: '#C9121F' }} />
          </div>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Laboratory Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Enter laboratory name"
                      {...field}
                      className={`border rounded-md ${theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-200'
                        }`}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center justify-end space-x-2 pt-4">
              <Button
                disabled={loading}
                variant="outline"
                onClick={labModal.onClose}
                className={`${theme === 'dark'
                  ? 'border-gray-600 hover:bg-gray-700'
                  : 'border-gray-200 hover:bg-gray-100'
                  }`}
              >
                Cancel
              </Button>
              <Button
                disabled={loading}
                type="submit"
                style={{ backgroundColor: '#C9121F' }}
                className="text-white hover:opacity-90"
              >
                Create Lab
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </Modal>
  );
};
