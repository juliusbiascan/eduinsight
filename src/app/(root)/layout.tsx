import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { auth } from "@/auth";


export default async function SetupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/auth/login");
  }

  const lab = await db.labaratory.findFirst({
    where: {
      userId: session.user.id,
    },
  });

  if (lab) {
    redirect(`/${lab.id}`);
  }

  return <>{children}</>;
}
