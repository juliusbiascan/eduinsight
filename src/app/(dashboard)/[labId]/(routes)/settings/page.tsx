import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import PageContainer from "@/components/layout/page-container";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { SettingsForm } from "./components/settings-form";

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
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading
            title='Settings'
            description='Manage your laboratory preferences'
          />
        </div>
        <Separator />
        <SettingsForm initialData={lab} />
      </div>
    </PageContainer>
  );
}

export default SettingsPage;
