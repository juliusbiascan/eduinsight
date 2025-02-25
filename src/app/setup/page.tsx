import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/auth/register-form";

const SetupRootAccount = async () => {
    const users = await db.user.findMany();

    if (users.length !== 0) {
        redirect("/");
    }

    return (
        <div className="flex h-full flex-col items-center justify-center space-y-6">
            <div className="flex flex-col space-y-2 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">
                    Setup Root Account
                </h1>
                <p className="text-sm text-muted-foreground">
                    Create your administrator account to get started
                </p>
            </div>
            <RegisterForm isRoot={true} />
        </div>
    );
}

export default SetupRootAccount;