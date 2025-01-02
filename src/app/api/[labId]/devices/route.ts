import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

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
      name,
      devId,
      devHostname,
      devMACaddress,
      isArchived
    } = body;

    if (!id) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!devId) new NextResponse("DevId is required", { status: 400 });

    if (!devHostname) new NextResponse("Hostname is required", { status: 400 });

    if (!devMACaddress) new NextResponse("Device MAC Address id is required", { status: 400 });


    if (!isArchived) new NextResponse("Archived is required", { status: 400 });


    if (!params.labId) {
      return new NextResponse("Lab Id is required", { status: 400 });
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

    const device = await db.device.create({
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
    console.log(`[DEVICE_POST] ${err}`);
    return new NextResponse(`Internal error`, { status: 500 })
  }
}

export async function GET(
  req: Request,
  { params }: { params: { labId: string } }
) {
  try {
    if (!params.labId) {
      return new NextResponse("Lab Id is required", { status: 400 });
    }

    const devices = await db.device.findMany({
      where: {
        labId: params.labId,
        isArchived: false
      },
      include: {
        powerMonitoringLogs: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        },
        activeUsers: {
          include: {
            user: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        activeUserLogs: {
          include: {
            user: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10 // Limit to last 10 entries
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(devices);

  } catch (err) {
    console.log(`[DEVICES_GET] ${err}`);
    return new NextResponse(`Internal error`, { status: 500 })
  }
}