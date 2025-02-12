"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

const formSchema = z.object({
  schoolId: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  course: z.enum(["BSA", "BSCRIM", "BEED", "BSBA", "BSCS", "BSHM", "BSTM"]),
  yearLevel: z.enum(["FIRST", "SECOND", "THIRD", "FOURTH"]),
  role: z.enum(["STUDENT", "TEACHER"]),
});

export const preRegister = async (
  values: z.infer<typeof formSchema>,
  labId: string
) => {
  try {
    const validatedFields = formSchema.safeParse(values);

    if (!validatedFields.success) {
      return { error: "Invalid fields!" };
    }

    const { schoolId } = validatedFields.data;
    const defaultPassword = "eduinsight";

    // Check if user already exists by schoolId only
    const existingUser = await db.deviceUser.findUnique({
      where: { schoolId }
    });

    if (existingUser) {
      return { error: "User already exists!" };
    }

   
    await db.deviceUser.create({
      data: {
        ...values,
        labId,
        email: '',
        contactNo: '',
        password: '',
      },
    });

    return { success: "User registered successfully" };
  } catch (error) {
    console.log(error);
    return { error: "Something went wrong!" };
  }
};
