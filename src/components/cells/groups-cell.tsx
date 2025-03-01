"use client";

import { useState } from "react";
import { MultiSelect } from "@/components/ui/multi-select";
import { DeleteClientButton, DeleteClientDialog } from "./delete-client-dialog";

type Group = {
    id: number;
    name: string;
};

interface GroupsCellProps {
    clientId: number;
    clientIdentifier: string;
    groups: string[];
    availableGroups: Group[];
    onUpdate: (clientId: number, groups: string[], clientIdentifier: string) => Promise<void>;
    onDelete?: (clientId: number, clientIdentifier: string) => Promise<void>;
}

export const GroupsCell = ({
    clientId,
    clientIdentifier,
    groups,
    availableGroups,
    onUpdate,
    onDelete
}: GroupsCellProps) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleUpdate = async (newValue: string[]) => {
        setIsLoading(true);
        try {
            await onUpdate(clientId, newValue, clientIdentifier);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!onDelete) return;
        try {
            await onDelete(clientId, clientIdentifier);
            setIsDeleting(false);
        } catch (error) {
            console.error('Failed to delete client:', error);
            throw error;
        }
    };

    return (
        <div className="flex items-center gap-2">
            <MultiSelect
                options={availableGroups.map(group => ({
                    label: group.name || `Group ${group.id}`,
                    value: group.id.toString(),
                }))}
                value={groups}
                onValueChange={handleUpdate}
                disabled={isLoading}
                placeholder="Select groups..."
                variant="inverted"
            />
            
            {onDelete && (
                <>
                    <DeleteClientButton onDelete={() => setIsDeleting(true)} />
                    <DeleteClientDialog 
                        isOpen={isDeleting}
                        onOpenChange={setIsDeleting}
                        onDelete={handleDelete}
                    />
                </>
            )}
        </div>
    );
};
