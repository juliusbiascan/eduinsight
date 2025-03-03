"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { InfoIcon, RefreshCw, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "../ui/alert";
import { useSearchParams } from "next/navigation";

export function GravityUpdateDialog() {
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [log, setLog] = useState<string>("");
    const [showSuccess, setShowSuccess] = useState(false);
    const logRef = useRef<string>("");
    const scrollRef = useRef<HTMLDivElement>(null);
    const searchParams = useSearchParams();
    const preRef = useRef<HTMLPreElement>(null);

    // Parse incoming log lines
    const parseLines = useCallback((text: string) => {
        // Remove ANSI escape sequences
        const cleanText = text.replace(/\x1B\[[0-9;]*[JKmsu]/g, '');
        // Split on carriage returns
        const lines = cleanText.split(/\r\n|\r|\n/);
        
        // Update the log with new content
        logRef.current = logRef.current + lines.join('\n') + '\n';
        setLog(logRef.current);

        // Check for completion
        if (text.includes("Done") || text.includes("Gravity list has been updated")) {
            setShowSuccess(true);
            setIsUpdating(false);
        }
    }, []);

    const handleUpdate = async () => {
        try {
            setIsUpdating(true);
            setShowSuccess(false);
            setLog("");
            logRef.current = "";

            const response = await fetch("/api/gravity", {
                method: "POST",
            });
            
            if (!response.body) {
                throw new Error('No response body');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            
            while (true) {
                const { done, value } = await reader.read();

                if (done) {
                    break;
                }

                // Decode the chunk and process it
                const text = decoder.decode(value, { stream: true });
                parseLines(text);
            }
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to update gravity lists",
                variant: "destructive",
            });
            setIsUpdating(false);
        }
    };

    // Auto-scroll log
    const scrollToBottom = useCallback(() => {
        if (preRef.current) {
            preRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
        }
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [log, scrollToBottom]);

    // Auto-start update if URL has ?go parameter
    useEffect(() => {
        if (searchParams.has("go") && !isUpdating) {
            setOpen(true);
            handleUpdate();
        }
    }, [searchParams]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <Button
                variant="default"
                onClick={() => setOpen(true)}
                disabled={isUpdating}
                className="gap-2"
            >
                {isUpdating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <RefreshCw className="h-4 w-4" />
                )}
                <span className="sr-only">
                    {isUpdating ? "Updating gravity lists" : "Update gravity lists"}
                </span>
            </Button>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Update Gravity Lists</DialogTitle>
                    <DialogDescription>
                        Running pihole -g to update gravity lists. This may take a few minutes.
                        Please do not navigate away from or close this page.
                    </DialogDescription>
                </DialogHeader>

                {/* Info Alert */}
                {(isUpdating && !showSuccess) && <Alert
                    className={`transition-opacity duration-200 `}
                >
                    <InfoIcon className="h-4 w-4" />
                    <AlertDescription>
                        Updating... this may take a while. Please wait.
                    </AlertDescription>
                </Alert>}

                {/* Success Alert */}
                {showSuccess && <Alert
                    className={`bg-green-50 text-green-900 transition-opacity duration-200 `}
                >
                    <InfoIcon className="h-4 w-4 text-green-500" />
                    <AlertDescription>
                        Update completed successfully!
                    </AlertDescription>
                </Alert>}

                <ScrollArea
                    className="h-[400px] w-full rounded-md border p-4 bg-black"
                >
                    <pre
                        ref={preRef}
                        className="text-white font-mono text-sm whitespace-pre-wrap"
                    >
                        {log || "Waiting for update to start..."}
                    </pre>
                </ScrollArea>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => setOpen(false)}
                        disabled={isUpdating}
                    >
                        Close
                    </Button>
                    <Button
                        variant="default"
                        onClick={handleUpdate}
                        disabled={isUpdating}
                    >
                        {isUpdating ? "Updating..." : "Start Update"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
