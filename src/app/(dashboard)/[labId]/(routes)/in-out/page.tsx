import { redirect } from 'next/navigation';
import InOutClient from './components/client';
import { db } from '@/lib/db';
import { auth } from '@/auth';

const InOutPage = async ({
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
    <InOutClient labId={lab.id} />
  );
}

export default InOutPage;