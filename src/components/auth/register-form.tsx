"use client";

import * as z from "zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import Image from "next/image";
import { Icons } from "../icons";
import { RegisterSchema } from "@/schemas";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CardWrapper } from "@/components/auth/card-wrapper"
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { register } from "@/actions/register";
import { PasswordInput } from "../ui/password-input";

const ExtendedRegisterSchema = RegisterSchema.extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

interface RegisterFormProps {
  token?: string | null;
  labId?: string | null;
  inviteEmail?: string | null;
  isRoot?: boolean;
}

export const RegisterForm = ({ 
  token, 
  labId,
  inviteEmail ,
  isRoot
}: RegisterFormProps) => {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof ExtendedRegisterSchema>>({
    resolver: zodResolver(ExtendedRegisterSchema),
    defaultValues: {
      email: inviteEmail || "",
      password: "",
      confirmPassword: "",
      name: "",
    },
  });

  const onSubmit = (values: z.infer<typeof ExtendedRegisterSchema>) => {
    setError("");
    setSuccess("");

    startTransition(() => {
      register(values, token, labId, isRoot)
        .then((data) => {
          if (data.success && labId) {
            // Update redirection path to match new structure
            window.location.href = `/teams/accept?labId=${labId}`;
          }
          setError(data.error);
          setSuccess(data.success);
        });
    });
  };

  return (
    <CardWrapper
      headerLabel="Create an account"
      headerComponent={
        <div className="flex items-center justify-center space-x-2 flex-wrap">
          <Image
            src="/passlogo-small.png"
            alt="PASS Logo"
            width={40}
            height={40}
            className="rounded-full border-2 border-[#C9121F] sm:w-12 sm:h-12"
          />
          <span className="text-xl sm:text-2xl font-bold text-[#C9121F] dark:text-white">
            Create Account
          </span>
        </div>
      }
      backButtonLabel="Already have an account?"
      backButtonHref="/auth/login"
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#C9121F] font-medium">{field.name}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder="Name"
                      className="border-2 border-gray-200 dark:border-gray-700 focus:border-[#C9121F] rounded-lg shadow-sm"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#C9121F] font-medium">{field.name}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending || !!inviteEmail}
                      placeholder="Email"
                      type="email"
                      className="border-2 border-gray-200 dark:border-gray-700 focus:border-[#C9121F] rounded-lg shadow-sm disabled:opacity-50"
                    />
                  </FormControl>
                  {inviteEmail && (
                    <p className="text-xs text-muted-foreground">
                      This email is from your team invitation
                    </p>
                  )}
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#C9121F] font-medium">{field.name}</FormLabel>
                  <FormControl>
                    <PasswordInput
                      {...field}
                      disabled={isPending}
                      placeholder="******"
                      className="border-2 border-gray-200 dark:border-gray-700 focus:border-[#C9121F] rounded-lg shadow-sm"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#C9121F] font-medium">{field.name}</FormLabel>
                  <FormControl>
                    <PasswordInput
                      {...field}
                      disabled={isPending}
                      placeholder="******"
                      className="border-2 border-gray-200 dark:border-gray-700 focus:border-[#C9121F] rounded-lg shadow-sm"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
          </div>
          <FormError message={error} />
          <FormSuccess message={success} />
          <Button
            disabled={isPending}
            type="submit"
            className="w-full bg-[#C9121F] hover:bg-red-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-300 ease-out shadow-md hover:shadow-lg"
          >
            {isPending && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
            Create an account
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};
