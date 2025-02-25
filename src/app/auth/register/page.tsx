import { RegisterForm } from "@/components/auth/register-form";
import { db } from "@/lib/db";

interface RegisterPageProps {
  searchParams: {
    token?: string;
    labId?: string;
  };
}

const RegisterPage = async ({ searchParams }: RegisterPageProps) => {
  let inviteEmail = null;

  if (searchParams.token && searchParams.labId) {
    const invitation = await db.teamInvitation.findFirst({
      where: {
        token: searchParams.token,
        labId: searchParams.labId,
        expires: {
          gt: new Date(),
        },
      },
    });
    inviteEmail = invitation?.email || null;
  }

  return (
    <RegisterForm 
      token={searchParams.token}
      labId={searchParams.labId}
      inviteEmail={inviteEmail}
    />
  );
};

export default RegisterPage;