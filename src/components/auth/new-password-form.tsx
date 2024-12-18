"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import Image from "next/image";
import { Icons } from "../icons";
import { PasswordInput } from "../ui/password-input";

import { NewPasswordSchema } from "@/schemas";
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
import { newPassword } from "@/actions/new-password";

export const NewPasswordForm = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof NewPasswordSchema>>({
    resolver: zodResolver(NewPasswordSchema),
    defaultValues: {
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof NewPasswordSchema>) => {
    setError("");
    setSuccess("");

    startTransition(() => {
      newPassword(values, token)
        .then((data) => {
          setError(data?.error);
          setSuccess(data?.success);
        });
    });
  };

  return (
    <CardWrapper
      headerLabel="Enter a new password"
      headerComponent={
        <div className="flex items-center justify-center space-x-2">
          <Image
            src="/passlogo-small.png"
            alt="SMNHS Logo"
            width={48}
            height={48}
            className="rounded-full border-2 border-pink-300"
          />
          <span className="text-2xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 text-transparent bg-clip-text">
            Reset Password
          </span>
        </div>
      }
      backButtonLabel="Back to login"
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
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-purple-600">New Password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      {...field}
                      disabled={isPending}
                      placeholder="******"
                      className="border-2 border-pink-200 focus:border-purple-400 rounded-lg"
                    />
                  </FormControl>
                  <FormMessage className="text-pink-500" />
                </FormItem>
              )}
            />
          </div>
          <FormError message={error} />
          <FormSuccess message={success} />
          <Button
            disabled={isPending}
            type="submit"
            className="w-full bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 hover:from-pink-500 hover:via-purple-500 hover:to-indigo-500 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105"
          >
            {isPending && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
            Reset password
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};
