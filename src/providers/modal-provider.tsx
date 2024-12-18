"use client";

import { useEffect, useState } from "react";

import { LabModal } from "@/components/modals/lab-modal";

export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <LabModal />
    </>
  );
}
