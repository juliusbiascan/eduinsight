"use client"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"

import { RegistrationColumn } from "./columns"
import { Button } from "@/components/ui/button"
import { Copy, Edit, MoreHorizontal, Trash } from "lucide-react"
import { toast } from "react-hot-toast"
import { useRouter, useParams } from "next/navigation"
import { useState } from "react"
import axios from "axios"
import { AlertModal } from "@/components/modals/alert-modal"
import { QRModal } from "@/components/modals/qr-modal"

interface CellActionProps {
    data: RegistrationColumn
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {

    const [loading, setLoading] = useState(false);
    const [openAlert, setOpenAlert] = useState(false);
    const [openQR, setOpenQR] = useState(false);

    const router = useRouter();
    const params = useParams();


    const onDelete = async () => {
        try {
            setLoading(true);
            await axios.delete(`/api/${params.labId}/registration/${data.id}`)
            router.refresh();
            toast.success("User deleted successfully.")
        } catch {
            toast.error('Error deleting');
        } finally {
            setLoading(false);
            setOpenAlert(false);
        }
    }

    return (
        <>
            <AlertModal
                isOpen={openAlert}
                onClose={() => setOpenAlert(false)}
                onConfirm={onDelete}
                loading={loading} />

            <QRModal
                isOpen={openQR}
                onClose={() => setOpenQR(false)}
                onConfirm={onDelete}
                loading={loading}
                data={data} />

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="w-8 h-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="w-4 h-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>
                        Actions
                    </DropdownMenuLabel>

                    <DropdownMenuItem onClick={() => setOpenQR(true)}>
                        <Copy className="w-4 h-4 mr-2" />
                        Generate QR
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push(`/admin/${params.labId}/registration/${data.id}`)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Update
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-500" onClick={() => setOpenAlert(true)}>
                        <Trash className="w-4 h-4 mr-2" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}