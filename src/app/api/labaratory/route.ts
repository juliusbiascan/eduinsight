import { auth } from '@/auth';
import { currentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(
  req: Request,
) {
  try {

    const session = await auth()


    const body = await req.json();

    const { name } = body;


    if (!session) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const { id } = session.user;

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    const lab = await db.labaratory.create({
      data: {
        name,
        userId: id
      }
    })

    return NextResponse.json(lab);

  } catch (error) {
    console.log('[LABARATORY_POST]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};
