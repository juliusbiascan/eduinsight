import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function PATCH(
  req: Request,
  { params }: { params: { labId: string } }
) {
  try {

    const session = await auth()


    const body = await req.json();

    const { name } = body;

    if (!session) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const { id } = session?.user

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!params.labId) {
      return new NextResponse("Lab id is required", { status: 400 });
    }

    const lab = await db.labaratory.updateMany({
      where: {
        id: params.labId,
        userId: id
      },
      data: {
        name,
      }
    })

    return NextResponse.json(lab);
  } catch (error) {
    console.log('[LAB_PATCH]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};

export async function DELETE(
  req: Request,
  { params }: { params: { labId: string } }
) {
  try {

    const session = await auth()

    if (!session) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const { id } = session?.user

    if (!params.labId) {
      return new NextResponse("Lab id is required", { status: 400 });
    }

    const lab = await db.labaratory.deleteMany({
      where: {
        id: params.labId,
        userId: id
      }
    })

    return NextResponse.json(lab);
  } catch (error) {
    console.log('[LAB_DELETE]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};
