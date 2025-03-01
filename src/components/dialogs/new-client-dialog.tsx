"use client";

import { useState, useEffect } from "react";
import { getClientSuggestions, type ClientSuggestion, createClient, getGroups, Group } from "@/lib/pihole";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Alert, AlertDescription } from "../ui/alert";
import { InfoIcon } from "lucide-react";
import { MultiSelect } from "@/components/ui/multi-select";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
    clients: z.array(z.string()).min(1, "At least one client must be selected"),
    comments: z.string().optional(),
    groups: z.array(z.string()).default([]), // Changed from optional to default empty array
});

type NewClientFormValues = z.infer<typeof formSchema>;

interface NewClientDialogProps {
    onClientCreated: () => Promise<void>;
}

export const NewClientDialog = ({ onClientCreated }: NewClientDialogProps) => {
    const { toast } = useToast();
    const [suggestions, setSuggestions] = useState<ClientSuggestion[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const [isLoadingGroups, setIsLoadingGroups] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [open, setOpen] = useState(false);

    const form = useForm<NewClientFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            clients: [],
            comments: "",
            groups: [], // Ensure this is initialized as empty array
        },
    });

    const fetchSuggestions = async () => {
        try {
            setIsLoadingSuggestions(true);
            const response = await getClientSuggestions();
            setSuggestions(response.clients);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch suggestions');
            console.error('Error fetching suggestions:', err);
        } finally {
            setIsLoadingSuggestions(false);
        }
    };

    const fetchGroups = async () => {
        try {
            setIsLoadingGroups(true);
            const response = await getGroups();
            setGroups(response.groups);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch groups');
            console.error('Error fetching groups:', err);
        } finally {
            setIsLoadingGroups(false);
        }
    };

    useEffect(() => {
        fetchSuggestions();
        fetchGroups();
    }, []);

    // Transform suggestions into options for MultiSelect
    const clientOptions = suggestions.map(suggestion => {
        const addresses = suggestion.addresses?.split(',') || [];
        const names = suggestion.names?.split(',') || [];
        const label = [
            ...names,
            ...addresses,
            suggestion.hwaddr,
            suggestion.macVendor
        ].filter(Boolean).join(' - ');
        
        // Use the first address as the value, fallback to MAC address
        const value = addresses[0] || suggestion.hwaddr || '';
        
        return {
            label,
            value,
            description: suggestion.macVendor || undefined
        };
    });

    // Transform groups into options for MultiSelect
    const groupOptions = groups.map(group => ({
        label: group.name || `Group ${group.id}`,
        value: group.id.toString(),
    }));

    const onSubmit = async (data: NewClientFormValues) => {
        try {
            const response = await createClient({
                client: data.clients,
                comment: data.comments || null,
                groups: data.groups.map(Number)
            });

            if (response.processed?.errors && response.processed.errors.length > 0) {
                const errorMessages = response.processed.errors
                    .map(error => `${error.item}: ${error.error}`)
                    .join('\n');
                toast({
                    variant: "destructive",
                    title: "Failed to add some clients",
                    description: errorMessages
                });
            } else {
                toast({
                    title: "Success",
                    description: "Client(s) added successfully"
                });
                form.reset();
                await onClientCreated();
                setOpen(false); // Close dialog on success
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to create client"
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>Add new client</Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-[1000px] p-4 md:p-6">
                <DialogHeader>
                    <DialogTitle className="text-xl md:text-2xl">Add New Client</DialogTitle>
                </DialogHeader>
                {error && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
                        <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                            <div className="space-y-4">
                                {/* Client selection field */}
                                <FormField
                                    control={form.control}
                                    name="clients"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Known Clients</FormLabel>
                                            <FormControl>
                                                <MultiSelect
                                                    options={clientOptions}
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                    placeholder={isLoadingSuggestions ? "Loading suggestions..." : "Select or add clients..."}
                                                    variant="inverted"
                                                    animation={2}
                                                    maxCount={3}
                                                    disabled={isLoadingSuggestions}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Group assignment field */}
                                <FormField
                                    control={form.control}
                                    name="groups"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Group assignment</FormLabel>
                                            <FormControl>
                                                <MultiSelect
                                                    options={groupOptions}
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                    placeholder={isLoadingGroups ? "Loading groups..." : "Select groups..."}
                                                    variant="inverted"
                                                    animation={2}
                                                    maxCount={3}
                                                    disabled={isLoadingGroups}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Comments field */}
                                <FormField
                                    control={form.control}
                                    name="comments"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Client Description (optional)</FormLabel>
                                            <FormControl>
                                                <Textarea {...field} placeholder="Add any comments about the clients" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Help text column */}
                            <div>
                                <Alert className="text-sm md:text-base h-full">
                                    <InfoIcon className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
                                    <AlertDescription className="space-y-2">
                                        <p>You can select an existing client or add a custom one by typing into the field above and confirming your entry with <kbd>&#x23CE;</kbd>.
                                            Multiple clients can be added by separating each client with a space or comma.</p>
                                        <p>Clients may be described either by their IP addresses (IPv4 and IPv6 are supported),
                                            IP subnets (CIDR notation, like <code>192.168.2.0/24</code>),
                                            their MAC addresses (like <code>12:34:56:78:9A:BC</code>),
                                            by their hostnames (like <code>localhost</code>), or by the interface they are connected to (prefaced with a colon, like <code>:eth0</code>).
                                        </p>
                                        <p>Note that client recognition by IP addresses (incl. subnet ranges) are preferred over MAC address, host name or interface recognition as
                                            the two latter will only be available after some time.
                                            Furthermore, MAC address recognition only works for devices at most one networking hop away from your Pi-hole.
                                        </p>
                                    </AlertDescription>
                                </Alert>
                            </div>
                        </div>

                        <Button type="submit" className="w-full">Add</Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
