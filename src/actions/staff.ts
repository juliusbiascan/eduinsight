"use server"

import { db } from "@/lib/db";
import { DeviceUserRole, State } from "@prisma/client";
import { DateRange } from "react-day-picker";


export const getActiveCount = async (labId: string, dateRange?: DateRange) => {
  const studentCount = await db.activeDeviceUser.count({
    where: {
      labId,
      state: State.ACTIVE,
      createdAt: {
        gte: dateRange?.from,
        lte: dateRange?.to,
      },
    }
  });

  return studentCount;
}


export const getStudentCount = async (labId: string, dateRange?: DateRange) => {
  const studentCount = await db.deviceUser.count({
    where: {
      labId,
      role: DeviceUserRole.STUDENT,
      createdAt: {
        gte: dateRange?.from,
        lte: dateRange?.to,
      },
    }
  });
  return studentCount;
}

export const getTeacherCount = async (labId: string, dateRange?: DateRange) => {
  const teacherCount = await db.deviceUser.count({
    where: {
      labId,
      role: DeviceUserRole.TEACHER,
      createdAt: {
        gte: dateRange?.from,
        lte: dateRange?.to,
      },
    }
  });
  return teacherCount;
}

export const getGuestCount = async (labId: string, dateRange?: DateRange) => {
  const guestCount = await db.deviceUser.count({
    where: {
      labId,
      role: DeviceUserRole.GUEST,
      createdAt: {
        gte: dateRange?.from,
        lte: dateRange?.to,
      },
    }
  });
  return guestCount;
}
export const getUserState = async (userId: string) => {
  const activeDeviceUser = await db.activeDeviceUser.count({
    where: {
      userId,
    }
  });

  return activeDeviceUser;
}

