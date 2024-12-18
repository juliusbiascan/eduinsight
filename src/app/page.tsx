import Image from "next/image";
import Link from "next/link";

import { Poppins } from "next/font/google";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LoginButton } from "@/components/auth/login-button";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

const font = Poppins({
  subsets: ["latin"],
  weight: ["600"]
})

export default async function Home() {
  const session = await auth()
   
  if (session) {
    redirect("/redirect")
  }

  return (
    <main className="flex flex-col min-h-screen relative bg-[#EAEAEB]">
      {/* Background overlay */}
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
        {/* Navigation */}
        <nav className="flex flex-wrap justify-between items-center p-4 sm:p-6 bg-white/80 backdrop-blur-md border-b border-[#1A1617]/10">
          <div className="flex items-center space-x-3 mb-4 sm:mb-0">
            <Image
              src="/passlogo-small.png" // Update with your server-themed logo
              alt="EduInsight Server"
              width={48}
              height={48}
              className="rounded-full border-2 border-[#EBC42E]"
            />
            <span className="text-[#1A1617] font-bold text-xl">EduInsight Server</span>
          </div>
          <div className="flex flex-wrap items-center space-x-4 sm:space-x-6">
            <Link href="#documentation" className="text-[#1A1617]/80 hover:text-[#C9121F] transition-colors duration-300">Documentation</Link>
            <Link href="#support" className="text-[#1A1617]/80 hover:text-[#C9121F] transition-colors duration-300">Support</Link>
            <LoginButton>
              <Button variant="secondary" size="sm" className="bg-[#EBC42E] text-[#1A1617] hover:bg-[#C9121F] hover:text-white transition-colors duration-300">
                Admin Login
              </Button>
            </LoginButton>
          </div>
        </nav>

        {/* Main content */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-8 sm:py-16">
          <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left side - Text content */}
            <div className="space-y-6 sm:space-y-8">
              <h1 className={cn(
                "text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight",
                font.className
              )}>
                EduInsight Lab Server
              </h1>
              <p className="text-white/90 text-lg sm:text-xl leading-relaxed">
                Computer Lab Monitoring system for educational computer labs. Monitor, control, and optimize your institution's digital infrastructure.
              </p>
              <p className="text-white/90 text-lg sm:text-xl leading-relaxed">
                Real-time monitoring, advanced analytics, and comprehensive reporting tools to enhance your educational IT infrastructure.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant='secondary' size='lg' className="bg-gradient-to-r from-[#C9121F] to-[#EBC42E] hover:from-[#C9121F]/90 hover:to-[#EBC42E]/90 text-white font-semibold text-lg px-6 sm:px-8 py-3 rounded-lg shadow-lg transition-all duration-300">
                  Download Client.exe
                </Button>
                <Button variant='outline' size='lg' className="border-[#1A1617] text-[#1A1617] hover:bg-[#1A1617]/5 font-semibold text-lg px-6 sm:px-8 py-3 rounded-lg">
                  View Documentation
                </Button>
              </div>
            </div>

            {/* Right side - Server Dashboard Preview */}
            <div className="relative mt-8 lg:mt-0">
              <div className="absolute inset-0 bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg"></div>
              <div className="relative z-10 p-4 sm:p-8">
                <Image
                  src="/server-dashboard.jpg" // Update with your dashboard preview
                  alt="Server Dashboard Preview"
                  width={600}
                  height={600}
                  className="w-full h-auto object-contain rounded-xl shadow-md"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Documentation Section */}
        <section id="documentation" className="relative z-20 py-16 bg-white/90">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className={cn(
              "text-3xl font-bold text-[#1A1617] text-center mb-12",
              font.className
            )}>
              Documentation
              {}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Quick Start Guide */}
              <div className="p-6 bg-white rounded-lg shadow-md border border-[#1A1617]/10">
                <h3 className="text-xl font-semibold text-[#1A1617] mb-4">Quick Start Guide</h3>
                <p className="text-[#1A1617]/80 mb-4">Learn how to install and configure EduInsight Lab Server in minutes.</p>
                <Button variant="outline" className="text-[#C9121F] border-[#C9121F] hover:bg-[#C9121F] hover:text-white">
                  Read Guide
                </Button>
              </div>

              {/* API Reference */}
              <div className="p-6 bg-white rounded-lg shadow-md border border-[#1A1617]/10">
                <h3 className="text-xl font-semibold text-[#1A1617] mb-4">API Reference</h3>
                <p className="text-[#1A1617]/70 mb-4">Complete API documentation for developers and integrators.</p>
                <Button variant="outline" className="text-[#C9121F] border-[#C9121F] hover:bg-[#C9121F] hover:text-white">
                  View API Docs
                </Button>
              </div>

              {/* Tutorials */}
              <div className="p-6 bg-white rounded-lg shadow-md border border-[#1A1617]/10">
                <h3 className="text-xl font-semibold text-[#1A1617] mb-4">Tutorials</h3>
                <p className="text-[#1A1617]/70 mb-4">Step-by-step tutorials for common tasks and configurations.</p>
                <Button variant="outline" className="text-[#C9121F] border-[#C9121F] hover:bg-[#C9121F] hover:text-white">
                  View Tutorials
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Support Section */}
        <section id="support" className="relative z-20 py-16 bg-white/95">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className={cn(
              "text-3xl font-bold text-[#1A1617] text-center mb-12",
              font.className
            )}>
              Support
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Community Support */}
              <div className="p-6 bg-white rounded-lg shadow-md border border-[#1A1617]/10">
                <h3 className="text-xl font-semibold text-[#1A1617] mb-4">Community Support</h3>
                <p className="text-[#1A1617]/70 mb-4">Join our community forum for discussions, tips, and peer support.</p>
                <Button className="bg-[#EBC42E] text-[#1A1617] hover:bg-[#C9121F] hover:text-white">
                  Join Community
                </Button>
              </div>

              {/* Technical Support */}
              <div className="p-6 bg-white rounded-lg shadow-md border border-[#1A1617]/10">
                <h3 className="text-xl font-semibold text-[#1A1617] mb-4">Technical Support</h3>
                <p className="text-[#1A1617]/70 mb-4">Get professional support from our technical team.</p>
                <Button className="bg-[#EBC42E] text-[#1A1617] hover:bg-[#C9121F] hover:text-white">
                  Contact Support
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Simple Footer */}
        <footer className="relative z-20 bg-[#1A1617] text-white py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-white/90">© 2024 EduInsight Lab. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </main>
  )
}