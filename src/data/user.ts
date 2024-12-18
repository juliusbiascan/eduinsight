"use server"

import { db } from "@/lib/db";
import { DateRange } from "react-day-picker";

export const getUserByEmail = async (email: string) => {
  try {
    const user = await db.user.findUnique({ where: { email } });

    return user;
  } catch {
    return null;
  }
};

export const getUserById = async (id: string) => {
  try {
    const user = await db.user.findUnique({ where: { id } });

    return user;
  } catch {
    return null;
  }
};

export const getDeviceUserById = async (id: string | undefined) => {
  try {
    const user = await db.deviceUser.findUnique({ where: { id } });

    return user;
  } catch {
    return null;
  }
}

export const getDeviceUserBySchoolId = async (schoolId: string) => {
  try {
    const user = await db.deviceUser.findUnique({ where: { schoolId } });

    return user;
  } catch {
    return null;
  }
}
export const getActiveDeviceUserByUserId = async (userId: string) => {
  try {
    const user = await db.activeDeviceUser.findFirst({
      where: {
        userId,
      }
    });
    return user;
  } catch {
    return null;
  }
}

export const getAllDeviceUserCount = async (labId: string, dateRange?: DateRange) => {
  try {
    const user = await db.deviceUser.count({
      where: {
        labId,
        createdAt: {
          gte: dateRange?.from,
          lte: dateRange?.to,
        },
      },
    });

    return user;
  } catch {
    return null;
  }
}

export const getAllDeviceUser = async (labId: string) => {
  try {
    const user = await db.deviceUser.findMany({
      where: {
        labId,
      },
    });

    return user;
  } catch {
    return null;
  }
}

