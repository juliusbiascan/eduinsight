import { signOut } from "@/auth"
import { FaSignOutAlt } from 'react-icons/fa'

export default function SignOut() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">Ready to leave?</h1>
        <p className="text-gray-600 mb-6">We hope to see you again soon!</p>
        <form
          action={async () => {
            "use server"
            await signOut({ redirectTo: "/" })
          }}
        >
          <button
            type="submit"
            className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center mx-auto"
          >
            <FaSignOutAlt className="mr-2" />
            Sign Out
          </button>
        </form>
      </div>
    </div>
  )
}