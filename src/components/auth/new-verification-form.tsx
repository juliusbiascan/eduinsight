"use client";

import { useCallback, useEffect, useState } from "react";
import { BeatLoader } from "react-spinners";
import { useSearchParams } from "next/navigation";

import { newVerification } from "@/actions/new-verification";
import { CardWrapper } from "@/components/auth/card-wrapper";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";

import Image from "next/image";
export const NewVerificationForm = () => {
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();

  const searchParams = useSearchParams();

  const token = searchParams.get("token");

  const onSubmit = useCallback(() => {
    if (success || error) return;

    if (!token) {
      setError("Missing token!");
      return;
    }

    newVerification(token)
      .then((data) => {
        setSuccess(data.success);
        setError(data.error);
      })
      .catch(() => {
        setError("Something went wrong!");
      })
  }, [token, success, error]);

  useEffect(() => {
    onSubmit();
  }, [onSubmit]);

  return (
    <CardWrapper
      headerLabel="Confirming your verification"
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
            Verify Account
          </span>
        </div>
      }
      backButtonLabel="Back to login"
      backButtonHref="/auth/login"
    >
      <div className="flex items-center w-full justify-center">
        {!success && !error && (
          <BeatLoader color="#8B5CF6" /> // Purple color to match the theme
        )}
        <FormSuccess message={success} />
        {!success && (
          <FormError message={error} />
        )}
      </div>
    </CardWrapper>
  )
}