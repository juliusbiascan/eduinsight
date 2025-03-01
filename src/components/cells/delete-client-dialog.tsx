import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteClientDialogProps {
    onDelete: () => Promise<void>;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export const DeleteClientButton = ({ onDelete }: { onDelete: () => void }) => (
    <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 p-0 text-destructive flex-shrink-0"
        onClick={onDelete}
    >
        <Trash2 className="h-4 w-4" />
    </Button>
);

export const DeleteClientDialog = ({ onDelete, isOpen, onOpenChange }: DeleteClientDialogProps) => (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Delete Client</AlertDialogTitle>
                <AlertDialogDescription>
                    Are you sure you want to delete this client? This action cannot be undone.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={onDelete}
                >
                    Delete
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
);
