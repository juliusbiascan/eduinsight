"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";

import { db } from "@/lib/db";
import { RegisterSchema } from "@/schemas";
import { getUserByEmail } from "@/data/user";
import { sendVerificationEmail } from "@/lib/mail";
import { generateVerificationToken } from "@/lib/tokens";

export const register = async (
  values: z.infer<typeof RegisterSchema>,
  token?: string | null,
  labId?: string | null,
  isRoot: boolean = false
) => {
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { email, password, name } = validatedFields.data;
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await db.user.findUnique({
    where: {
      email,
    }
  });

  if (existingUser) {
    return { error: "Email already in use!" };
  }

  try {
    const user = await db.$transaction(async (tx) => {
      // Create the user with root role if isRoot is true
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          emailVerified: isRoot ? new Date() : undefined,
        },
      });

      // Handle team invitation only if not creating root account
      if (!isRoot && token && labId) {
        const invitation = await tx.teamInvitation.findFirst({
          where: {
            token,
            labId,
            email,
            expires: {
              gt: new Date(),
            },
          },
          include: {
            team: true,
          },
        });

        if (invitation) {
          // Update user with team info
          await tx.user.update({
            where: { id: newUser.id },
            data: {
              teamId: invitation.teamId,
              teamRole: invitation.role,
              emailVerified: new Date(),
            },
          });

          // Delete the used invitation
          await tx.teamInvitation.delete({
            where: { id: invitation.id },
          });
        }
      }

      return newUser;
    });

    return { success: "User registered!" };
  } catch (error) {
    return { error: "Something went wrong!" };
  }
};
