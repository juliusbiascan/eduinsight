"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { updateGroup, type Group } from "@/lib/pihole";

const formSchema = z.object({
    name: z.string().min(1, "Group name is required"),
    comment: z.string().optional(),
    enabled: z.boolean().default(true),
});

type EditGroupFormValues = z.infer<typeof formSchema>;

interface EditGroupDialogProps {
    group: Group;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onGroupUpdated?: () => void;
}

export const EditGroupDialog = ({ 
    group,
    open, 
    onOpenChange,
    onGroupUpdated 
}: EditGroupDialogProps) => {
    const form = useForm<EditGroupFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: group.name,
            comment: group.comment || "",
            enabled: group.enabled,
        },
    });

    const [error, setError] = useState<string | null>(null);

    const onSubmit = async (data: EditGroupFormValues) => {
        try {
            setError(null);
            await updateGroup(group.name, {
                name: data.name,
                comment: data.comment || null,
                enabled: data.enabled
            });
            onOpenChange(false);
            form.reset();
            onGroupUpdated?.();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update group');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Group</DialogTitle>
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

                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">Update Group</Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
