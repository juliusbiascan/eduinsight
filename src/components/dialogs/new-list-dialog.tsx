"use client";

import { useState } from "react";
import { addList, AddListRequest, Group } from "@/lib/pihole";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MultiSelect } from "@/components/ui/multi-select";
import { useToast } from "@/hooks/use-toast";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";

interface NewListDialogProps {
    availableGroups: Group[];
    onListCreated: () => Promise<void>;
}

export const NewListDialog = ({ availableGroups, onListCreated }: NewListDialogProps) => {
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState<Partial<AddListRequest>>({
        address: '',
        comment: null,
        groups: [0],
        enabled: true,
        type: 'block'
    });

    const groupOptions = availableGroups.map(group => ({
        label: group.name || `Group ${group.id}`,
        value: group.id.toString(),
    }));

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const value = e.target.value;
        setFormData(prev => ({
            ...prev,
            [e.target.name]: value === '' ? null : value
        }));
    };

    const handleGroupSelection = (selectedGroups: string[]) => {
        setFormData(prev => ({
            ...prev,
            groups: selectedGroups.map(Number)
        }));
    };

    const handleAddList = async (type: 'allow' | 'block') => {
        try {
            if (!formData.address) {
                toast({
                    title: "Error",
                    description: "Address is required",
                    variant: "destructive"
                });
                return;
            }

            const addresses = typeof formData.address === 'string'
                ? formData.address.split(/[\s,]+/).filter(Boolean)
                : formData.address;

            await addList({
                ...formData,
                type,
                address: addresses
            } as AddListRequest);

            await onListCreated();
            setOpen(false);
            
            // Reset form
            setFormData({
                address: '',
                comment: null,
                groups: [0],
                enabled: true,
                type: 'block'
            });

            toast({
                title: "Success",
                description: "List added successfully",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to add list",
                variant: "destructive"
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add List
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add a new subscribed list</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">
                            URL <span className="text-destructive">*</span>
                        </label>
                        <Input
                            placeholder="Enter list URL"
                            name="address"
                            value={formData.address as string}
                            onChange={handleInputChange}
                        />
                        <p className="text-sm text-muted-foreground">
                            Multiple lists can be added by separating each unique URL with a space or comma.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">
                            List description
                        </label>
                        <Textarea
                            placeholder="Enter description for this list"
                            name="comment"
                            value={formData.comment || ''}
                            onChange={handleInputChange}
                            rows={3}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">
                            Group Assignments
                        </label>
                        <MultiSelect
                            options={groupOptions}
                            defaultValue={['0']}
                            onValueChange={handleGroupSelection}
                            placeholder="Select groups..."
                            className="mt-2"
                        />
                    </div>

                    <div className="flex gap-4 justify-end pt-4">
                        <Button onClick={() => handleAddList('block')}>
                            Add Block List
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => handleAddList('allow')}
                        >
                            Add Allow List
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
