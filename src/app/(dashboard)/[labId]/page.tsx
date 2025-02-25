
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

interface DashboardPageProps { params: { labId: string; }; }

const DashboardPage: React.FC<DashboardPageProps> = async ({ params }) => {
  const session = await auth();

  if (!session) redirect("/auth/login");


  const team = await db.team.findFirst({
    where: {
      labId: params.labId,
      users: {
        some: {
          id: session.user.id,
        },
      }
    }
  });

  if (team) {
    const lab = await db.labaratory.findFirst({
      where: {
        id: team.labId,
      },
    });

    if (!lab) {
      redirect('/');
    } else {
      redirect(`${params.labId}/overview`);
    }
  }

  const lab = await db.labaratory.findFirst({ where: { id: params.labId, userId: session.user.id } });

  if (!lab) {
    redirect('/');
  } else {
    redirect(`${params.labId}/overview`);
  }
}

export default DashboardPage;