"use client"

import React from 'react'
import { Button } from "@/components/ui/button"
import { Heading } from "@/components/ui/heading"
import { Plus, Laptop, Zap } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { DeviceColumn, columns } from "./columns"
import { DataTable } from "@/components/ui/data-table"
import { ApiList } from "@/components/ui/api-list"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"

interface DeviceClientProps {
  data: DeviceColumn[]
}

export const DeviceClient: React.FC<DeviceClientProps> = ({
  data
}) => {
  const router = useRouter();
  const params = useParams();

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
              <Laptop className="w-8 h-8 text-[#C9121F]" />
              <Heading
                title={`Devices (${data?.length})`}
                description="Manage devices for your laboratory"
                className="text-black dark:text-white"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <DataTable columns={columns} data={data} searchKey="name" title="Devices" />

      <Card className="bg-[#EAEAEB] dark:bg-[#1A1617] backdrop-blur supports-[backdrop-filter]:bg-opacity-60">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3 mb-3">
            <Zap className="w-6 h-6 text-[#C9121F] animate-pulse" />
            <Heading
              title="API"
              description="API calls for Devices"
              className="text-black dark:text-white"
            />
          </div>
          <ApiList entityName="devices" entityIdName="deviceId" />
        </CardContent>
      </Card>
    </motion.div>
  )
}