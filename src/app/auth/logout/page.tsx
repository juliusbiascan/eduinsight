import { signOut } from "@/auth"
import { FaSignOutAlt } from 'react-icons/fa'
import Image from "next/image"

export default function SignOut() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/95 w-[95%] sm:w-[400px] p-6 rounded-2xl shadow-xl border-2 border-[#C9121F]/10 backdrop-blur-sm">
        <div className="flex flex-col items-center space-y-4">
          <Image
            src="/passlogo-small.png"
            alt="Logo"
            width={64}
            height={64}
            className="rounded-full border-2 border-[#C9121F] shadow-lg"
          />
          <h1 className="text-2xl sm:text-3xl font-bold text-[#C9121F]">Ready to leave?</h1>
          <p className="text-gray-600 text-center">We hope to see you again soon!</p>
          
          <form
            action={async () => {
              "use server"
              await signOut({ redirectTo: "/" })
            }}
            className="w-full mt-4"
          >
            <button
              type="submit"
              className="w-full bg-[#C9121F] hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 ease-out shadow-md hover:shadow-lg flex items-center justify-center"
            >
              <FaSignOutAlt className="mr-2" />
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}