"use server";

import * as z from "zod";
import { db } from "@/lib/db";
import { ClockInSchema } from "@/schemas";
import { State } from "@prisma/client";

export const clockIn = async (values: z.infer<typeof ClockInSchema>) => {

	const { deviceId, userId } = values;

	const activeDeviceUser = await db.activeDeviceUser.findFirst({
		where: { userId }
	});

	if (activeDeviceUser) {
		await logoutUser(activeDeviceUser.deviceId, userId);
		return { success: "User logged out successfully", deviceId: activeDeviceUser.deviceId, userId: userId, state: 'logout' };
	} else {
		const deviceUser = await db.deviceUser.findFirst({
			where: { id: userId }
		});

		if (!deviceUser) {
			return { error: "User not found" };
		}

		await loginUser(deviceId, userId);
		return { success: "User logged in successfully", deviceId: deviceId, userId: deviceUser.id, labId: deviceUser.labId, state: 'login' };
	}
};

async function loginUser(deviceId: string, userId: string) {
	const device = await db.device.findUnique({
		where: { id: deviceId }
	});

	if (!device) {
		throw new Error("Device not found");
	}

	if (device.isUsed) {
		throw new Error("Device is already in use");
	}

	await db.$transaction([
		db.activeDeviceUser.create({
			data: {
				labId: device.labId,
				deviceId,
				userId,
				state: State.ACTIVE
			},
		}),
		db.device.update({
			where: { id: deviceId },
			data: { isUsed: true }
		}),
		db.activeUserLogs.create({
			data: {
				labId: device.labId,
				deviceId,
				userId
			}
		})
	]);

}

async function logoutUser(deviceId: string, userId: string) {
	await db.$transaction([
		db.activeDeviceUser.deleteMany({
			where: { userId },
		}),
		db.device.update({
			where: { id: deviceId },
			data: { isUsed: false }
		})
	]);
}