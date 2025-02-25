import { db } from "@/lib/db";
import { sendTeamInvitationEmail } from "@/lib/mail";
import { TeamRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["ADMIN", "MEMBER"]),
  labId: z.string(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, role, labId } = inviteSchema.parse(body);

    console.log("Processing invitation for:", { email, role, labId }); // Debug log

    const result = await db.$transaction(async (tx) => {
      // Check if user exists
      const user = await tx.user.findUnique({
        where: { email }
      });

      console.log("Found user:", user); // Debug log

      // Find or create team
      let team = await tx.team.findUnique({
        where: { labId }
      });

      if (!team) {
        team = await tx.team.create({
          data: {
            labId,
            name: "Lab Team"
          }
        });
        console.log("Created new team:", team); // Debug log
      }

      if (user) {
        // Check if already a member
        const existingMembership = await tx.user.findFirst({
          where: {
            id: user.id,
            teamId: team.id
          }
        });

        if (existingMembership) {
          throw new Error("User is already a team member");
        }

        // Update user with team membership
        const updatedUser = await tx.user.update({
          where: { id: user.id },
          data: {
            teamId: team.id,
            teamRole: role as TeamRole
          }
        });

        console.log("Updated user with team:", updatedUser); // Debug log
        return { team, user: updatedUser };
      }

      // Handle new user invitation
      const token = uuidv4();
      const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 3);

      await tx.teamInvitation.create({
        data: {
          email,
          role: role as TeamRole,
          token,
          labId,
          teamId: team.id,
          expires
        }
      });

      return { team, token };
    });

    // Send invitation email
    await sendTeamInvitationEmail(
      email,
      role,
      labId,
      result.token // Will be undefined for existing users
    );
    
    return NextResponse.json({ 
      message: "Invitation sent successfully",
      teamId: result.team.id
    });
    
  } catch (error) {
    console.error("Team invitation error:", error);
    
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 400 });
    }

    // Handle Prisma errors
    if (typeof error === 'object' && error !== null && 'code' in error) {
      switch (error.code) {
        case 'P2002':
          return new NextResponse("Team already exists", { status: 400 });
        case 'P2003':
          return new NextResponse("Invalid user or team reference", { status: 400 });
        default:
          console.error("Database error:", error);
      }
    }

    return new NextResponse("Failed to send invitation", { status: 500 });
  }
}
