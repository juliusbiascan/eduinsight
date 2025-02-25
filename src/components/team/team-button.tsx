"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Users } from "lucide-react";
import { TeamInviteForm } from "./team-invite-form";
import { useState } from "react";

export function TeamButton() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="ml-auto">
          <Users className="mr-2 h-4 w-4" />
          Team
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Team</DialogTitle>
          <DialogDescription>
            Invite administrators to help manage your laboratory.
          </DialogDescription>
        </DialogHeader>
        <TeamInviteForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
