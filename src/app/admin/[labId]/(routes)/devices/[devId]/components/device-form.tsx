"use client"

import { useState } from 'react'
import * as z from 'zod'
import { Device } from "@prisma/client";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Trash } from "lucide-react";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { AlertModal } from '@/components/modals/alert-modal';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Laptop } from "lucide-react";
import React from 'react';

interface DeviceFormProps {
  initialData: Device | null;
}

const formSchema = z.object({

  name: z.string().min(1),
  devId: z.string().min(1),
  devHostname: z.string().min(1),
  devMACaddress: z.string().min(1),
  isArchived: z.boolean().default(false).optional()
})

type DeviceFormValues = z.infer<typeof formSchema>;

export const DeviceForm: React.FC<DeviceFormProps> = ({
  initialData,
}) => {

  const params = useParams();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const title = initialData ? 'Edit device' : 'Register device'
  const description = initialData ? 'Edit a device' : 'Register a new device'
  const toastMessage = initialData ? 'Device updated.' : 'Device registered.'
  const action = initialData ? 'Save changes' : 'Register'

  const form = useForm<DeviceFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      ...initialData,
    } : {
      name: '',
      devId: '',
      devHostname: '',
      devMACaddress: '',
      isArchived: false,
    }
  });

  const onSubmit = async (data: DeviceFormValues) => {
    try {
      setLoading(true);
      if (initialData) {
        await axios.patch(`/api/${params.labId}/devices/${params.devId}`, data)
      } else {
        await axios.post(`/api/${params.labId}/devices`, data)
      }
      router.push(`/admin/${params.labId}/devices`);
      toast.success(toastMessage)
      router.refresh();
    } catch (err) {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false)
    }
  }

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/${params.labId}/devices/${params.devId}`)
      router.refresh();
      router.push(`/admin/${params.labId}/devices`)
      toast.success("Devices deleted.")
    } catch (err) {
      toast.error("Something Went Wrong.");
    } finally {
      setLoading(false)
      setOpen(false);
    }
  }

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />
      <div className="p-4 space-y-4 bg-gradient-to-br from-pink-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <Card className="w-full max-w-3xl mx-auto overflow-hidden border border-pink-200 dark:border-pink-700 shadow-sm">
          <CardHeader className="pb-2 bg-gradient-to-r from-pink-100 to-blue-100 dark:from-pink-900 dark:to-blue-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Laptop className="w-6 h-6 text-primary" />
                <CardTitle>{title}</CardTitle>
              </div>
              {initialData && (
                <Button variant="outline" size="sm" onClick={() => setOpen(true)} disabled={loading}>
                  <Trash className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{description}</p>
          </CardHeader>
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input disabled={loading} placeholder='Device Name' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="devId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Device Id / <b>Client id</b></FormLabel>
                        <FormControl>
                          <Input disabled={loading} placeholder='Device Id' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="devHostname"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hostname</FormLabel>
                        <FormControl>
                          <Input disabled={loading} placeholder='Device Hostname' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="devMACaddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>MAC Address</FormLabel>
                        <FormControl>
                          <Input disabled={loading} placeholder='Device MAC Address' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="isArchived"
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-start p-4 space-x-3 space-y-0 border rounded-md bg-muted'>
                      <FormControl>
                        <Checkbox

                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className='space-y-1 leading-none'>
                        <FormLabel>
                          Archived
                        </FormLabel>
                        <FormDescription>
                          This device will not appear anywhere in the lab.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                <Button disabled={loading} className='w-full' type='submit'>{action}</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </>
  )
}