"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { HintText } from "@/components/ui/hint-text";
import { Alert, AlertDescription } from "../ui/alert";
import { InfoIcon } from "lucide-react";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { createGroup } from "@/lib/pihole";

const formSchema = z.object({
    name: z.string().min(1, "Group name is required"),
    comment: z.string().optional(),
    enabled: z.boolean().default(true),
});

type NewGroupFormValues = z.infer<typeof formSchema>;

export const NewGroupDialog = ({ onGroupCreated }: { onGroupCreated?: () => void }) => {
    const form = useForm<NewGroupFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            comment: "",
            enabled: true,
        },
    });

    const [open, setOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const onSubmit = async (data: NewGroupFormValues) => {
        try {
            setError(null);
            await createGroup({
                name: data.name,
                comment: data.comment || null,
                enabled: data.enabled
            });
            setOpen(false);
            form.reset();
            onGroupCreated?.();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create group');
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>Add new group</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Group</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Group Name</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Enter group name" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="comment"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Comment (optional)</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} placeholder="Add a comment about this group" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="enabled"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <FormLabel>Enable group</FormLabel>
                                </FormItem>
                            )}
                        />

                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <Button type="submit" className="w-full">Add Group</Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
