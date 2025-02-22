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


const lato = Lato({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  display: 'swap'
});

export const metadata: Metadata = {
  metadataBase: new URL('https://admin.eduinsight.systems'),
  title: "EduInsight - Computer Lab Monitoring System",
  description: "EduInsight is a comprehensive computer lab monitoring system for educational institutions. Monitor student activities, track computer usage, and manage lab resources efficiently.",
  keywords: "computer lab monitoring, educational software, lab management, student monitoring, computer tracking",
  authors: [{ name: "EduInsight Team" }],
  openGraph: {
    title: "EduInsight - Computer Lab Monitoring System",
    description: "Comprehensive computer lab monitoring system for educational institutions",
    url: "https://admin.eduinsight.systems",
    siteName: "EduInsight",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "EduInsight Dashboard Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "EduInsight - Computer Lab Monitoring System",
    description: "Comprehensive computer lab monitoring system for educational institutions",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/site.webmanifest",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon-16x16.png",
  },
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
