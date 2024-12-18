import { auth } from "@/auth";
import { db } from "@/lib/db";
import { DeviceUserRole } from "@prisma/client";
import { NextResponse } from "next/server"

export async function GET(
  req: Request,
  { params }: { params: { devId: string } }
) {
  try {

    if (!params.devId) {
      return new NextResponse("User id is required", { status: 400 });
    }

    const deviceUser = await db.deviceUser.findUnique({
      where: {
        id: params.devId,
      },
    })

    return NextResponse.json(deviceUser);
  } catch (err) {
    console.log('[DEVICE_USER_GET]', err)
    return new NextResponse('Internal error', { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { labId: string, devUserId: string } }
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

    if (!image) new NextResponse("Image is required", { status: 400 });

    if (!role) new NextResponse("Role is required", { status: 400 });

    if (!params.devUserId) {
      return new NextResponse("Product id is required", { status: 400 });
    }

    const deviceUser = await db.deviceUser.update({
      where: {
        id: params.devUserId
      },
      data: {
        labId: params.labId,
        schoolId,
        firstName,
        lastName,
        role: role == "GUEST" ? DeviceUserRole.GUEST : role == "STUDENT" ? DeviceUserRole.STUDENT : DeviceUserRole.TEACHER,
      }
    })

    return NextResponse.json(deviceUser);

  } catch (err) {
    console.log('[DEVICE_USER_PATCH]', err)
    return new NextResponse('Internal error', { status: 500 })
  }
}

//// Delete Method

export async function DELETE(
  req: Request,
  { params }: { params: { labId: string, devUserId: string } }
) {
  try {

    const session = await auth();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const { id } = session.user;

    if (!id) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }

    if (!params.devUserId) {
      return new NextResponse("Device id is required", { status: 400 });
    }

    const device = await db.deviceUser.deleteMany({
      where: {
        id: params.devUserId,
      }
    })

    return NextResponse.json(device);
  } catch (err) {
    console.log('[DEVICE_DELETE]', err)
    return new NextResponse('Internal error', { status: 500 })
  }
}