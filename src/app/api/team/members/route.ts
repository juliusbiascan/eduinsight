import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";

const memberSchema = z.object({
  labId: z.string(),
});

export async function POST(req: Request) {
  try {
    // Verify authentication
    const session = await auth();
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { labId } = memberSchema.parse(body);

    if (!db) {
      throw new Error("Database client not initialized");
    }

    // Find team and its members
    const team = await db.team.findUnique({
      where: { labId },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            teamRole: true,
            createdAt: true,
          },
        },
      },
    });

    if (!team) {
      return NextResponse.json({ members: [] });
    }

    const members = team.users.map((user) => ({
      id: user.id,
      user: {
        name: user.name || 'Unnamed User',
        email: user.email || '',
        image: user.image,
      },
      role: user.teamRole || 'MEMBER',
      createdAt: user.createdAt.toISOString(),
    }));

    return NextResponse.json({ members });

  } catch (error) {
    console.error("Team members fetch error:", error);
    return NextResponse.json({ 
      members: [],
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
