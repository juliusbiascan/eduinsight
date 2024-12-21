"use client"

import { Copy, Server } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./alert";
import { Badge, BadgeProps } from "./badge";
import { Button } from "./button";
import { toast } from "react-hot-toast";

interface ApiAlertProps {
    title: string;
    description: string;
    variant: 'read' | 'write';
    info?: string;
}

const variantMap: Record<ApiAlertProps["variant"], {
    color: BadgeProps["variant"],
    label: string
}> = {
    read: {
        color: "secondary",
        label: "Read"
    },
    write: {
        color: "default",
        label: "Write"
    }
}

export const ApiAlert: React.FC<ApiAlertProps> = ({
    title,
    description,
    variant = 'read',
    info
}) => {
    const onCopy = () => {
        navigator.clipboard.writeText(description);
        toast.success("API Route copied to the clipboard");
    };

    return (
        <Alert className="border-2 hover:border-muted-foreground/50 transition-colors">
            <div className="flex items-center gap-x-4">
                <Server className="h-4 w-4" />
                <div className="flex-1">
                    <div className="flex items-center gap-x-2">
                        <AlertTitle className="flex items-center gap-x-2">
                            <span className="font-mono font-bold">{title}</span>
                            <Badge variant={variantMap[variant].color}>
                                {variantMap[variant].label}
                            </Badge>
                        </AlertTitle>
                    </div>
                    {info && (
                        <p className="text-xs text-muted-foreground mt-1">
                            {info}
                        </p>
                    )}
                    <AlertDescription className="mt-2 flex items-center justify-between">
                        <code className="relative rounded bg-muted px-[0.5rem] py-[0.2rem] font-mono text-sm font-semibold">
                            {description}
                        </code>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={onCopy}
                            className="h-8 px-2"
                        >
                            <Copy className="h-4 w-4" />
                        </Button>
                    </AlertDescription>
                </div>
            </div>
        </Alert>
    )
}