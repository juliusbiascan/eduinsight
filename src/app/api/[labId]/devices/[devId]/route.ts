import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server"

export async function GET(
  req: Request,
  { params }: { params: { devId: string } }
) {
  try {

    if (!params.devId) {
      return new NextResponse("Device id is required", { status: 400 });
    }

    const device = await db.device.findUnique({
      where: {
        id: params.devId,
      },
    })

    return NextResponse.json(device);
  } catch (err) {
    console.log('[DEVICE_GET]', err)
    return new NextResponse('Internal error', { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { labId: string, devId: string } }
) {
  try {

    const session = await auth();

    const body = await req.json();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const { id } = session.user;

    const {
      name,
      devId,
      devHostname,
      devMACaddress,
      isArchived
    } = body;

    if (!id) {
      return new NextResponse("Unauthenticated", { status: 401 })
    }

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!devId) new NextResponse("DevId is required", { status: 400 });

    if (!devHostname) new NextResponse("Hostname is required", { status: 400 });

    if (!devMACaddress) new NextResponse("Device MAC Address id is required", { status: 400 });

    if (!isArchived) new NextResponse("Archived is required", { status: 400 });


    if (!params.devId) {
      return new NextResponse("Product id is required", { status: 400 });
    }

    const labByUserId = await db.labaratory.findFirst({
      where: {
        id: params.labId,
        userId: id,
      }
    })

    if (!labByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const device = await db.device.update({
      where: {
        id: params.devId
      },
      data: {
        name,
        devId,
        devHostname,
        devMACaddress,
        isArchived,
        labId: params.labId
      }
    })

    return NextResponse.json(device);

  } catch (err) {
    console.log('[DEVICE_PATCH]', err)
    return new NextResponse('Internal error', { status: 500 })
  }
}

//// Delete Method

export async function DELETE(
  req: Request,
  { params }: { params: { labId: string, devId: string } }
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

    if (!params.devId) {
      return new NextResponse("Device id is required", { status: 400 });
    }

    const labByUserId = await db.labaratory.findFirst({
      where: {
        id: params.labId,
        userId: id
      }
    })

    if (!labByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const device = await db.device.deleteMany({
      where: {
        id: params.devId,
      }
    })

    return NextResponse.json(device);
  } catch (err) {
    console.log('[DEVICE_DELETE]', err)
    return new NextResponse('Internal error', { status: 500 })
  }
}