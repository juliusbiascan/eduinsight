import "./globals.css";
import type { Metadata } from "next";
import { Lato } from 'next/font/google';
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import { ThemeProvider } from "@/providers/theme-provider";
import { ModalProvider } from "@/providers/modal-provider";
import { ToasterProvider } from "@/providers/toast-provider";
import { SocketProvider } from "@/providers/socket-provider";
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import NextTopLoader from 'nextjs-toploader';
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

const lato = Lato({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  display: 'swap'
});


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  
  return (
    <SessionProvider session={session}>
      <html lang="en">
        <body  className={`${lato.className}`} suppressHydrationWarning={true}>
        <NextTopLoader />
        <NuqsAdapter>
          <SocketProvider>
            <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
              <ToasterProvider />
              <ModalProvider />
              {children}
            </ThemeProvider>
          </SocketProvider>
          </NuqsAdapter>
        </body>
      </html>
    </SessionProvider>
  );
}
