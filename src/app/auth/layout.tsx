import Image from "next/image";

const AuthLayout = ({
  children
}: {
  children: React.ReactNode
}) => {
  return (
    <main className="flex flex-col min-h-screen relative">
      {/* Background image */}
      <Image
        src="/server-bg.jpg"
        alt="Welcome Background"
        fill
        sizes="100vw"
        priority
        className="absolute inset-0 z-0 object-cover"
      />
      {/* Gradient overlay - updated to match PASS logo colors */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-600/90 via-yellow-500/80 to-black/80 z-10"></div>

      {/* Content wrapper */}
      <div className="relative z-20 flex flex-col min-h-screen">
        {/* Navigation placeholder */}
        <nav className="h-[72px]"></nav>

        {/* Main content */}
        <div className="flex-1 flex items-center justify-center px-8 py-16">
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}

export default AuthLayout;