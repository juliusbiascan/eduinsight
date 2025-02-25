import { db } from "@/lib/db";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { z } from "zod";

const acceptSchema = z.object({
  labId: z.string(),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { labId } = acceptSchema.parse(body);

    const email = session.user.email;
    if (!email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Start a transaction
    const result = await db.$transaction(async (tx) => {
      // Get user
      const user = await tx.user.findUnique({
        where: { email },
        include: { team: true }
      });

      if (!user) {
        throw new Error("User not found");
      }

      if (user.teamId) {
        throw new Error("Already a team member");
      }

      // Get team
      const team = await tx.team.findUnique({
        where: { labId }
      });

      if (!team) {
        throw new Error("Team not found");
      }

      // Verify invitation exists
      const invitation = await tx.teamInvitation.findFirst({
        where: {
          email,
          teamId: team.id,
          expires: {
            gt: new Date()
          }
        }
      });

      if (!invitation) {
        throw new Error("No valid invitation found");
      }

      // Update user with team membership
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          teamId: team.id,
          teamRole: invitation.role
        }
      });

      // Delete the invitation
      await tx.teamInvitation.delete({
        where: { id: invitation.id }
      });

      return { team, user: updatedUser };
    });

    return NextResponse.json({
      message: "Successfully joined team"
    });

  } catch (error) {
    console.error("Team accept error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid request data" }, { status: 400 });
    }

    const errorMessage = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json(
      { message: errorMessage },
      { status: errorMessage.includes("Not found") ? 404 : 400 }
    );
  }
}
