import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { DeviceUserRole } from "@prisma/client";

export async function POST(
  req: Request,
  { params }: { params: { labId: string } }
) {
  try {

    const session = await auth();

    const body = await req.json();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const { id } = session.user;

    const {
      schoolId,
      firstName,
      lastName,
      image,
      email,
      course,
      yearLevel,
      contactNo,
      address,
      password,
      role
    } = body;

    if (!id) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    if (!schoolId) {
      return new NextResponse("School is required", { status: 400 });
    }

    if (!firstName) {
      return new NextResponse("FirstName is required", { status: 400 });
    }

    if (!lastName) {
      return new NextResponse("LastName is required", { status: 400 });
    }

    if (!image) {
      return new NextResponse("Image is required", { status: 400 });
    }

    if (!role) {
      return new NextResponse("Role is required", { status: 400 });
    }

    if (!params.labId) {
      return new NextResponse("Lab Id is required", { status: 400 });
    }

    if (!course) {
      return new NextResponse("Course is required", { status: 400 });
    }

    if (!yearLevel) {
      return new NextResponse("Year Level is required", { status: 400 });
    }

    if (!password) {
      return new NextResponse("Password is required", { status: 400 });
    }

    const device = await db.deviceUser.create({
      data: {
        labId: params.labId,
        schoolId,
        email,
        firstName,
        lastName,
        course,
        yearLevel,
        contactNo,
        address,
        password,
        role: role == "GUEST" ? DeviceUserRole.GUEST : role == "STUDENT" ? DeviceUserRole.STUDENT : DeviceUserRole.TEACHER,
      }
    })

    return NextResponse.json(device);

  } catch (err) {
    console.log(`[DEVICE_USER_POST] ${err}`);
    return new NextResponse(`Internal error`, { status: 500 })
  }
}