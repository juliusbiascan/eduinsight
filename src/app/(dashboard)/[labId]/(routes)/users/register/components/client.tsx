"use client"

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import { z } from "zod";
import axios from "axios";
import { UserPlus2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Heading } from "@/components/ui/heading";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { Icons } from "@/components/icons";
import { preRegister } from "@/actions/pre-register";
import { UserInfoModal } from "@/components/modals/user-info-modal";

const formSchema = z.object({
  schoolId: z.string().min(1, "School ID is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  course: z.enum(["BSA", "BSCRIM", "BEED", "BSBA", "BSCS", "BSHM", "BSTM"]),
  yearLevel: z.enum(["FIRST", "SECOND", "THIRD", "FOURTH"]),
  role: z.enum(["STUDENT", "TEACHER"]),
});

export const RegisterClient = () => {
  const params = useParams();
  const router = useRouter();
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [registeredUser, setRegisteredUser] = useState<any>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      schoolId: "",
      firstName: "",
      lastName: "",
      course: "BSCS",
      yearLevel: "FIRST",
      role: "STUDENT",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setError("");
    setSuccess("");

    startTransition(async () => {
      const result = await preRegister(values, params.labId as string);
      
      if (result.success) {
        setSuccess(result.success);
        setRegisteredUser({
          ...values,
          password: "eduinsight" // Show default password in modal
        });
        setIsModalOpen(true);
      }

      if (result.error) {
        setError(result.error);
      }
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Card className="bg-white/10 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/20">
              <UserPlus2 className="w-8 h-8 text-[#C9121F]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Pre Register User</h2>
              <p className="text-gray-500 dark:text-gray-400">Add a new user to the system</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold">User Information</h3>
          <Separator />
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  name="schoolId"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-[#C9121F] font-medium">
                        School ID
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isPending}
                          placeholder="Enter school ID"
                          className="transition-all border-2 focus-visible:ring-1 focus-visible:ring-red-500 focus-visible:border-red-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="role"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-[#C9121F] font-medium">Role</FormLabel>
                      <Select disabled={isPending} onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="STUDENT">Student</SelectItem>
                          <SelectItem value="TEACHER">Teacher</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="firstName"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-[#C9121F] font-medium">First Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isPending}
                          placeholder="Enter first name"
                          className="transition-all border-2 focus-visible:ring-1 focus-visible:ring-red-500 focus-visible:border-red-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="lastName"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-[#C9121F] font-medium">Last Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isPending}
                          placeholder="Enter last name"
                          className="transition-all border-2 focus-visible:ring-1 focus-visible:ring-red-500 focus-visible:border-red-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="course"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-[#C9121F] font-medium">Course</FormLabel>
                      <Select disabled={isPending} onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select course" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="BSA">BSA</SelectItem>
                          <SelectItem value="BSCRIM">BSCRIM</SelectItem>
                          <SelectItem value="BEED">BEED</SelectItem>
                          <SelectItem value="BSBA">BSBA</SelectItem>
                          <SelectItem value="BSCS">BSCS</SelectItem>
                          <SelectItem value="BSHM">BSHM</SelectItem>
                          <SelectItem value="BSTM">BSTM</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="yearLevel"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-[#C9121F] font-medium">Year Level</FormLabel>
                      <Select disabled={isPending} onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select year level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="FIRST">First Year</SelectItem>
                          <SelectItem value="SECOND">Second Year</SelectItem>
                          <SelectItem value="THIRD">Third Year</SelectItem>
                          <SelectItem value="FOURTH">Fourth Year</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {(error || success) && (
                <div className="space-y-2">
                  <FormError message={error} />
                  <FormSuccess message={success} />
                </div>
              )}

              <div className="flex items-center justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isPending}
                  onClick={() => router.push(`/${params.labId}/users`)}
                  className="border-2"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="bg-[#C9121F] hover:bg-red-700 text-white min-w-[140px]"
                >
                  {isPending ? (
                    <>
                      <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Register User"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <UserInfoModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          router.push(`/${params.labId}/users`);
          router.refresh();
        }}
        userInfo={registeredUser}
      />
    </div>
  );
};
