"use client"

import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import React from "react"

export const ControlPanelClient = () => {

  return (
    <>
      <Heading
        title={`Control Panel`}
        description="Adjust your device setting in your laboratory" />
      <Separator />
      <div className="h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl">(Soon if Applicable)</h1>
      </div>
    </>
  )
}