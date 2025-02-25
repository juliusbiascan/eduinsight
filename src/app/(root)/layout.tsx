import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { auth, signOut } from "@/auth";

export default async function SetupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const users = await db.user.findMany();

    if (users.length === 0) {
      return redirect("/setup");
    }

    const session = await auth();

    if (!session) {
      return redirect("/auth/login");
    }

    const user = await db.user.findUnique({
      where: {
        id: session.user.id
      }
    });

    if (!user) {
      return await signOut({ redirectTo: "/" });
    }

    const team = await db.team.findFirst({
      where: {
        users: {
          some: {
            id: session.user.id,
          },
        }
      }
    });

    let lab = null;

    if (team?.labId) {
      lab = await db.labaratory.findUnique({
        where: {
          id: team.labId,
        },
      });
    } else {
      lab = await db.labaratory.findUnique({
        where: {
          id: session.user.id,
        },
      });
    }

    if (lab?.id) {
      return redirect(`/${lab.id}`);
    }

    return <>{children}</>;
  } catch (error) {
    console.error("Layout Error:", error);
    return redirect("/error");
  }
}
