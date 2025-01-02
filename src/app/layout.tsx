import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import { ThemeProvider } from "@/providers/theme-provider";
import { ModalProvider } from "@/providers/modal-provider";
import { ToasterProvider } from "@/providers/toast-provider";
import { SocketProvider } from "@/providers/socket-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EduInsight",
  description: "Developed by Julius Biascan",
  authors: [
    {
      name: "Julius Biascan",
      url: "https://juliusbiascan.vercel.app",
    },
  ],
  creator: "juliusbiascan",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  
  return (
    <SessionProvider session={session}>
      <html lang="en">
        <body className={inter.className} suppressHydrationWarning={true}>
          <SocketProvider>
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
              <ToasterProvider />
              <ModalProvider />
              {children}
            </ThemeProvider>
          </SocketProvider>
        </body>
      </html>
    </SessionProvider>
  );
}
