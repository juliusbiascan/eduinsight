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

export const RegisterForm = () => {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof ExtendedRegisterSchema>>({
    resolver: zodResolver(ExtendedRegisterSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      name: "",
    },
  });

  const onSubmit = (values: z.infer<typeof ExtendedRegisterSchema>) => {
    setError("");
    setSuccess("");

    startTransition(() => {
      register(values)
        .then((data) => {
          setError(data.error);
          setSuccess(data.success);
        });
    });
  };

  return (
    <CardWrapper
      headerLabel="Create an account"
      headerComponent={
        <div className="flex items-center justify-center space-x-2">
          <Image
            src="/passlogo-small.png"
            alt="PASS Logo"
            width={48}
            height={48}
            className="rounded-full border-2 border-red-500 dark:border-red-400"
          />
          <span className="text-2xl font-bold bg-gradient-to-r from-red-600 to-yellow-500 dark:from-red-500 dark:to-yellow-400 text-transparent bg-clip-text">
            Join us today!
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
                  <FormLabel className="text-red-600">Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder="Name"
                      className="border-2 border-red-200 dark:border-red-800 focus:border-yellow-500 dark:focus:border-yellow-400 rounded-lg"
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
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder="Email"
                      type="email"
                      className="border-2 border-red-200 dark:border-red-800 focus:border-yellow-500 dark:focus:border-yellow-400 rounded-lg"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      {...field}
                      disabled={isPending}
                      placeholder="******"
                      className="border-2 border-red-200 dark:border-red-800 focus:border-yellow-500 dark:focus:border-yellow-400 rounded-lg"
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
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      {...field}
                      disabled={isPending}
                      placeholder="******"
                      className="border-2 border-red-200 dark:border-red-800 focus:border-yellow-500 dark:focus:border-yellow-400 rounded-lg"
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
            className="w-full bg-gradient-to-r from-red-600 to-yellow-500 dark:from-red-500 dark:to-yellow-400 hover:from-red-700 hover:to-yellow-600 dark:hover:from-red-600 dark:hover:to-yellow-500 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105"
          >
            {isPending && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
            Create an account
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};
