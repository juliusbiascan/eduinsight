"use server"

import { db } from "@/lib/db";
import { State } from "@prisma/client";
import { getDeviceUserById } from "./user";
import { DateRange } from "react-day-picker";

export const getAllDevice = async (labId: string) => {
  try {
    const device = await db.device.findMany({ where: { labId, isUsed: false, } });
    return device;
  } catch {
    return null;
  }
};

export const getTotalDevices = async (labId: string, dateRange?: DateRange) => {
  try {
    const device = await db.device.count({
      where: {
        labId,
        createdAt: {
          gte: dateRange?.from,
          lte: dateRange?.to,
        },
      },
    });
    return device;
  } catch {
    return null;
  }
};

export const getDeviceById = async (devId: string) => {
  try {
    const device = await db.device.findUnique({ where: { id: devId } });
    return device;
  } catch {
    return null;
  }
};

export const getActiveUserDevice = async (userId: string) => {
  try {
    const device = await db.activeDeviceUser.findUnique({ where: { id: userId } });
    return device;
  } catch {
    return null;
  }
};
export const getAllActiveUserDevice = async (labId: string) => {
  try {
    const device = await db.activeDeviceUser.findMany({ where: { labId, state: State.ACTIVE } });
    return device;
  } catch {
    return null;
  }
};
export const getAllInactiveUserDevice = async (labId: string) => {
  try {
    const device = await db.device.findMany({ where: { labId, isUsed: false } });
    return device;
  } catch {
    return null;
  }
};

export const getDeviceUserFullnameById = async (userId: string) => {
  try {
    const user = await getDeviceUserById(userId);
    if (user) {
      return `${user.firstName} ${user.lastName}`
    } else {
      return "Unknown"
    }
  } catch {
    return null
  }
}