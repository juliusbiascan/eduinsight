"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function AcceptInvitationPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const labId = searchParams.get("labId");

  useEffect(() => {
    const acceptInvitation = async () => {
      try {
        if (!labId) throw new Error("Missing lab ID");

        const response = await fetch(`/api/team/accept`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ labId }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to accept invitation");
        }

        toast({
          title: "Success",
          description: "You have successfully joined the team.",
        });

        router.push(`/${labId}/teams`);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Something went wrong");
      } finally {
        setIsLoading(false);
      }
    };

    if (labId) {
      acceptInvitation();
    } else {
      setError("Invalid invitation link");
      setIsLoading(false);
    }
  }, [labId, router, toast]);

  return (
    <div className="container flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Team Invitation</CardTitle>
          <CardDescription>
            {isLoading ? "Processing your invitation..." : "Invitation status"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9121F]" />
              <p className="text-sm text-muted-foreground">
                Please wait while we process your invitation...
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-red-500">{error}</p>
              <Button
                variant="outline"
                onClick={() => router.push("/auth/login")}
              >
                Return to Login
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
