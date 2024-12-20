"use client"

import React, { useState, useTransition, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator";
import { Form, FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { DeviceUserForm } from "@/schemas";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { ClockInModal } from "@/components/modals/clockin-modal";
import { Rainbow, UserPlus, Users, Activity } from "lucide-react";
import { StatsCard } from '@/components/stats-card';
import { getAllActiveUserDevice } from "@/data/device";
import { getAllDeviceUser } from "@/data/user";

interface InOutClientProps {
  labId: string;
}

const InOutClient = ({ labId }: InOutClientProps) => {
  const [open2, setOpen2] = useState('');
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();
  const [activeUsers, setActiveUsers] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [newUsersToday, setNewUsersToday] = useState(0);

  const form = useForm<z.infer<typeof DeviceUserForm>>({
    resolver: zodResolver(DeviceUserForm),
    defaultValues: { schoolId: '' }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const activeDevices = await getAllActiveUserDevice(labId);
        if (activeDevices)
          setActiveUsers(activeDevices.length);

        const allUsers = await getAllDeviceUser(labId);

        if (allUsers) {
          const today = new Date().toISOString().split('T')[0];
          const newUsers = allUsers.filter(user => user.createdAt.toISOString().startsWith(today));
          setNewUsersToday(newUsers.length);
          setTotalUsers(allUsers.length);
        }


      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to fetch user data");
      }
    };

    fetchData();
  }, [labId]);

  const onSubmit = async (data: z.infer<typeof DeviceUserForm>) => {
    setError(""); setSuccess("");
    startTransition(async () => {
      try { setOpen2(data.schoolId); }
      catch (err) { console.log(err); toast.error(`Something went wrong.`); }
    });
  }

  const onConfirm = (error: string | undefined, success: string | undefined) => {
    setError(error); setSuccess(success); setOpen2('');
  }

  return (
    <div className="p-4 space-y-4 bg-gradient-to-br from-pink-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
        <div className="flex items-center">
          <Rainbow className="h-6 w-6 text-pink-500 dark:text-pink-400 mr-2" />
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-blue-500 dark:from-pink-400 dark:to-blue-400">In/Out</h1>
        </div>
        <div className="flex items-center space-x-2">

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center space-x-2">
              <FormField
                control={form.control}
                name="schoolId"
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormControl>
                      <Input
                        disabled={isPending}
                        placeholder="Enter school ID"
                        className="rounded-full border-2 border-pink-300 focus:border-blue-400 transition-colors"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-pink-500" />
                  </FormItem>
                )}
              />
              <Button
                disabled={isPending}
                className="rounded-full bg-gradient-to-r from-pink-400 to-blue-400 hover:from-pink-500 hover:to-blue-500 dark:from-pink-500 dark:to-blue-500 dark:hover:from-pink-600 dark:hover:to-blue-600 transition-all duration-300 transform hover:scale-105"
                type="submit"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </Button>
            </form>
          </Form>
        </div>
      </div>
      <div className="grid gap-2 grid-cols-2 sm:grid-cols-3">
        <StatsCard title="Active Users" value={activeUsers} icon={<Activity className="h-4 w-4" />} />
        <StatsCard title="Total Users" value={totalUsers} icon={<Users className="h-4 w-4" />} />
        <StatsCard title="New Users Today" value={newUsersToday} icon={<UserPlus className="h-4 w-4" />} />
      </div>
      <Separator className="my-4" />
      <FormError message={error} />
      <FormSuccess message={success} />
      <Card className="overflow-hidden border border-pink-200 dark:border-pink-700 shadow-sm">
        <CardHeader className="pb-2 bg-gradient-to-r from-pink-100 to-blue-100 dark:from-pink-900 dark:to-blue-900">
          <CardTitle className="text-base flex items-center">
            <UserPlus className="h-4 w-4 text-pink-500 dark:text-pink-400 mr-2" /> User list
          </CardTitle>
          <CardDescription>List of device users</CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          TODO: Not yet implemented
        </CardContent>
      </Card>
      <ClockInModal isOpen={open2 != ''} onClose={() => setOpen2('')} onConfirm={onConfirm} loading={isPending} userId={open2} />
    </div>
  );
}

export default InOutClient;