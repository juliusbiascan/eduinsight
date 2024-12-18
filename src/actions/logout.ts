"use server";

import { signOut } from "@/auth";
import { db } from "@/lib/db";

export const logout = async () => {
  await signOut({ redirectTo: "/" });
};

export const logoutUser = async (userId: string, deviceId: string) => {

  await db.activeDeviceUser.deleteMany({
    where: {
      userId,
      deviceId
    }
  });

  await db.device.updateMany({
    where: {
      id: deviceId,
    },
    data: {
      isUsed: false
    }
  });

  return { success: "User logout successfully" };
}
