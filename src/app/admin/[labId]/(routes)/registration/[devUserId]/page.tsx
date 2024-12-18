import { db } from "@/lib/db";
import { DeviceUserForm } from "./components/registration-form";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Heading } from "@/components/ui/heading";
import { UserPlus2 } from "lucide-react";

const DevUserRegistrationPage = async ({ params }: { params: { labId: string, devUserId: string } }) => {

  const session = await auth()

  if (!session) {
    redirect("/auth/login")
  }

  const devUser = await db.deviceUser.findUnique({
    where: {
      id: params.devUserId
    },
  });


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
    <div className="flex-col space-y-4 bg-gradient-to-br from-pink-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 min-h-screen">
      <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
        <div className="flex items-center space-x-2">
          <UserPlus2 className="w-6 h-6 text-pink-500 dark:text-pink-400" />
          <Heading
            title="User Registration"
            description="Manage device user profiles"
            className="text-sm"
          />
        </div>
      </div>
      <DeviceUserForm
        initialData={devUser}
        labId={lab.id}
      />
    </div>
  )
}

export default DevUserRegistrationPage;
