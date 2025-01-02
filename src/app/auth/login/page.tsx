import { LoginForm } from "@/components/auth/login-form";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

const DEFAULT_USER = {
  name: "Admin",
  email: "eduinsight.pass@gmail.com",
  password: "admin",
};

const LoginPage = async () => {

  const hashedPassword = await bcrypt.hash(DEFAULT_USER.password, 10);

  const user = db.user.findFirst({
    where: {
      email: DEFAULT_USER.email,
    },
  });

  if (!user) {
    await db.user.create({
      data: {
        name: DEFAULT_USER.name,
        email: DEFAULT_USER.email,
        password: hashedPassword,
        emailVerified: new Date(),
      },
    });
  }

  return ( 
    <LoginForm />
  );
}
 
export default LoginPage;