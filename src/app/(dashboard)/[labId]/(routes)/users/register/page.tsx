import PageContainer from '@/components/layout/page-container';
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { RegisterClient } from "./components/client";

const RegisterPage = async () => {
    return (
        <PageContainer>
            <div className='flex flex-1 flex-col space-y-4'>
                <Heading
                    title="Pre Register User"
                    description="Add a new user to the system"
                />
                <Separator />
                <RegisterClient />
            </div>
        </PageContainer>
    );
}

export default RegisterPage;