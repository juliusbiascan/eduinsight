import { redirect } from "next/navigation";
import { SettingsForm } from "./components/settings-form";
import { auth } from "@/auth";
import { db } from "@/lib/db";


const SettingsPage = async ({
  params
}: {
  params: { labId: string }
}) => {

  const session = await auth()

  if (!session) {
    redirect("/auth/login")
  }

  const lab = await db.labaratory.findFirst({
    where: {
      id: params.labId,
      userId: session.user.id,
    }
  });


  if (!lab) {
    redirect('/');
  };

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <SettingsForm initialData={lab} />
      </div>
    </div>
  );
}

export default SettingsPage;
