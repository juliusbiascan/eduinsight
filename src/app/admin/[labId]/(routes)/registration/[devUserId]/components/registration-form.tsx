"use client"

import * as z from 'zod'
import { useState } from 'react'
import { DeviceUser } from "@prisma/client"
import { Heading } from "@/components/ui/heading"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Check, ChevronsUpDown, Trash, Heart, Sparkles } from "lucide-react"
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { toast } from 'react-hot-toast'
import axios from 'axios'
import { useParams, useRouter } from 'next/navigation'
import { AlertModal } from '@/components/modals/alert-modal'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from '@/lib/utils'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import CustomWebcam from '@/components/custom-webcam'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface DeviceUserFormProps {
  initialData: DeviceUser | null
  labId: string
}

const formSchema = z.object({
  schoolId: z.string().min(1, "School ID is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  image: z.string({
    required_error: "Please take a profile picture"
  }).min(1),
  role: z.string({
    required_error: "Please select a user role",
  }),
  gender: z.enum(["MALE", "FEMALE"], {
    required_error: "Please select a gender",
  }),
  grade: z.string({
    required_error: "Please select a grade level",
  }),
  contactNo: z.string().optional(),
  address: z.string().optional(),
})

type DeviceUserFormValues = z.infer<typeof formSchema>

export const DeviceUserForm: React.FC<DeviceUserFormProps> = ({
  initialData,
  labId,
}) => {
  const params = useParams()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const title = initialData ? 'Update User Profile' : 'New User Registration'
  const description = initialData ? 'Modify existing user information' : 'Create a new user profile'
  const toastMessage = initialData ? 'Profile updated successfully' : 'New user registered successfully'
  const action = initialData ? 'Save Changes' : 'Complete Registration'

  const roles = [
    { label: "Student", value: "STUDENT", description: "Access to basic learning resources" },
    { label: "Teacher", value: "TEACHER", description: "Full access to teaching tools" },
    { label: "Guest", value: "GUEST", description: "Limited temporary access" },
  ]

  const form = useForm<DeviceUserFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      ...initialData,
    } : {
      schoolId: '',
      firstName: '',
      lastName: '',
      image: '',
      role: 'STUDENT',
      gender: 'MALE',
      grade: '',
      contactNo: '',
      address: '',
    }
  })

  const onSubmit = async (data: DeviceUserFormValues) => {
    try {
      setLoading(true)
      if (initialData) {
        await axios.patch(`/api/${labId}/registration/${params.devUserId}`, data)
      } else {
        await axios.post(`/api/${labId}/registration`, data)
      }
      router.push('/staff/registration')
      router.refresh()
      toast.success(toastMessage)
    } catch (error) {
      toast.error("Failed to process request. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const onDelete = async () => {
    try {
      setLoading(true)
      await axios.delete(`/api/${labId}/registration/${initialData?.id}`)
      router.refresh()
      router.push('/staff/registration')
      toast.success("User profile deleted successfully")
    } catch (error) {
      toast.error("Failed to delete user. Please try again.")
    } finally {
      setLoading(false)
      setOpen(false)
    }
  }

  return (
    <div className="p-6 bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-950 dark:to-purple-950 rounded-xl shadow-xl w-full">
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />

      <Card className="w-full shadow-lg border-2 border-pink-300 dark:border-pink-800 rounded-xl overflow-hidden backdrop-blur-sm bg-white/80 dark:bg-gray-900/80">
        <CardHeader className="space-y-3 p-6 bg-gradient-to-r from-pink-200/70 to-purple-200/70 dark:from-pink-900/70 dark:to-purple-900/70">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {initialData ? (
                <div className="p-2 bg-pink-100 dark:bg-pink-900 rounded-full">
                  <Heart className="w-7 h-7 text-pink-500 dark:text-pink-400 animate-pulse" />
                </div>
              ) : (
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-full">
                  <Sparkles className="w-7 h-7 text-purple-500 dark:text-purple-400 animate-bounce" />
                </div>
              )}
              <Heading title={title} description={description} />
            </div>
            {initialData && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setOpen(true)}
                disabled={loading}
                className="hover:scale-105 transition-transform duration-200"
              >
                <Trash className="w-4 h-4 mr-2" />
                Remove
              </Button>
            )}
          </div>
          <Separator className="bg-gradient-to-r from-pink-200 to-purple-200 dark:from-pink-800 dark:to-purple-800" />
        </CardHeader>

        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">Profile Photo</FormLabel>
                        <FormControl>
                          <CustomWebcam
                            value={field.value}
                            disabled={loading}
                            onSave={(value) => form.setValue("image", value)}
                            onRemove={() => form.setValue("image", "")}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="schoolId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">School ID</FormLabel>
                        <FormControl>
                          <Input
                            disabled={loading}
                            placeholder="Enter school ID"
                            className="h-9 text-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">First Name</FormLabel>
                        <FormControl>
                          <Input
                            disabled={loading}
                            placeholder="Enter your first name"
                            className="h-9 text-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">Last Name</FormLabel>
                        <FormControl>
                          <Input
                            disabled={loading}
                            placeholder="Enter your last name"
                            className="h-9 text-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">User Role</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "w-full justify-between h-9 transition-all duration-300 hover:scale-[1.02] border-pink-200 dark:border-pink-700",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value
                                  ? roles.find(
                                    (role) => role.value === field.value
                                  )?.label
                                  : "Select a role"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0">
                            <Command>
                              <CommandInput placeholder="Search roles..." />
                              <CommandEmpty>No matching roles found.</CommandEmpty>
                              <CommandGroup>
                                <CommandList>
                                  {roles.map((role) => (
                                    <CommandItem
                                      value={role.label}
                                      key={role.value}
                                      onSelect={() => {
                                        form.setValue("role", role.value)
                                      }}
                                      className="flex items-center gap-2 p-3 cursor-pointer hover:bg-accent"
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          role.value === field.value
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      <div>
                                        <p className="font-medium">{role.label}</p>
                                        <p className="text-sm text-muted-foreground">{role.description}</p>
                                      </div>
                                    </CommandItem>
                                  ))}
                                </CommandList>
                              </CommandGroup>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">Gender</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-9 transition-all duration-300 focus:scale-[1.02] border-pink-200 dark:border-pink-700">
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="MALE">Male</SelectItem>
                            <SelectItem value="FEMALE">Female</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch("role") !== "TEACHER" && (
                    <FormField
                      control={form.control}
                      name="grade"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">Grade Level</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-9 transition-all duration-300 focus:scale-[1.02] border-pink-200 dark:border-pink-700">
                                <SelectValue placeholder="Select grade level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {[7, 8, 9, 10, 11, 12].map((grade) => (
                                <SelectItem key={grade} value={grade.toString()}>
                                  Grade {grade}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="contactNo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">Contact Number</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter contact number"
                            className="h-9 transition-all duration-300 focus:scale-[1.02] border-pink-200 dark:border-pink-700"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">Address</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Enter address"
                            className="min-h-[100px] transition-all duration-300 focus:scale-[1.02] border-pink-200 dark:border-pink-700"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-6">
                <Button
                  disabled={loading}
                  type="submit"
                  size="lg"
                  className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 
                  transform hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg rounded-full"
                >
                  {initialData ? (
                    <Heart className="w-5 h-5 mr-2 animate-pulse" />
                  ) : (
                    <Sparkles className="w-5 h-5 mr-2 animate-bounce" />
                  )}
                  {action}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
