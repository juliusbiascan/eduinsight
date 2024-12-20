"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { UserPlus2, Rainbow } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { RegistrationColumn, columns } from "./columns"
import { DataTable } from "@/components/ui/data-table"
import React from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { motion } from 'framer-motion'
import { Heading } from '@/components/ui/heading'

interface RegistrationClientProps {
  data: RegistrationColumn[]
}

export const RegistrationClient: React.FC<RegistrationClientProps> = ({
  data
}) => {

  const params = useParams();
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      <Card className="bg-[#EAEAEB] dark:bg-[#1A1617] backdrop-blur supports-[backdrop-filter]:bg-opacity-60">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Rainbow className="w-8 h-8 text-[#C9121F]" />
              <Heading
                title={`Device Users (${data?.length})`}
                description="Manage registered users"
                className="text-black dark:text-white"
              />
            </div>
            
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#EAEAEB] dark:bg-[#1A1617] backdrop-blur supports-[backdrop-filter]:bg-opacity-60">
        <CardHeader className="pb-2">
          <div className="flex items-center space-x-2">
            <UserPlus2 className="h-5 w-5 text-[#C9121F]" />
            <h2 className="text-lg font-semibold">Registered Users</h2>
          </div>
          <Separator className="mt-2" />
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={data}
            searchKey="firstName"
            title="Device Users"
          />
        </CardContent>
      </Card>
    </motion.div>
  )
}