"use client";

import { useEffect } from "react";
import { useLabModal } from "@/hooks/use-lab-modal";

const SetupPage = () => {
  const onOpen = useLabModal((state) => state.onOpen);
  const isOpen = useLabModal((state) => state.isOpen);

  useEffect(() => {
    if (!isOpen) {
      onOpen();
    }
  }, [isOpen, onOpen]);

  return null;
};

export default SetupPage;

