import { RegisterClient } from "./components/client";

const RegisterPage = async () => {
    return (
        <div className="flex-col">
            <div className="flex-1 p-8 pt-6 space-y-4">
                <RegisterClient />
            </div>
        </div>

    );
}

export default RegisterPage;