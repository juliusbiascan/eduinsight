import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { auth, signOut } from "@/auth";

export default async function SetupLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const users = await db.user.findMany();

  if (users.length === 0) {
    redirect("/setup");
  }

  const session = await auth();

  if (!session) {
    redirect("/auth/login");
  }

  const user = await db.user.findUnique({
    where: {
      id: session.user.id
    }
  });

  if (!user) {
    await signOut({ redirectTo: "/" });
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

  if (team) {
    lab = await db.labaratory.findUnique({
      where: {
        id: team.labId,
      },
    });
  } else {
    lab = await db.labaratory.findFirst({
      where: {
        userId: session.user.id,
      },
    });
  }

  if (lab) {
    return redirect(`/${lab.id}`);
  }

  return <>{children}</>;
}
