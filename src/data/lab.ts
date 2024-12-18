"use server"

import { db } from "@/lib/db";

export const getLabByUserId = async (id: string) => {
  try {
    const lab = await db.labaratory.findUnique({
      where: {
        id
      }
    })

    return lab;
  } catch {
    return null;
  }
};