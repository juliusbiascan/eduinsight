"use client"

import { PowerMonitoringLogs } from "@prisma/client"
import { LogItem } from "./log-item"
import React from "react"

interface PowerLogClientProps {
  data: PowerMonitoringLogs[]
}

export const PowerLogClient: React.FC<PowerLogClientProps> = ({
  data
}) => {
  if (data.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500 text-lg">No logs available yet.</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-4 gap-4 font-bold mb-4">
        <div>Timestamp</div>
        <div>Power State</div>
        <div>User</div>
        <div>Device</div>
      </div>
      {data.map((pm) => (
        <LogItem key={pm.id} item={pm} />
      ))}
    </>
  )
}