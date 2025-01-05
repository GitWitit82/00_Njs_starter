import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"
import { Sidebar } from "@/components/sidebar"
import { SessionProvider } from "@/components/session-provider"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Toaster } from "@/components/ui/toaster"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Workflow PMS",
  description: "Workflow and Project Management System",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="flex min-h-screen">
              {session && (
                <div className="w-64 flex-shrink-0">
                  <Sidebar />
                </div>
              )}
              <main className={session ? "flex-1 px-8 py-6 bg-background" : "w-full"}>
                {children}
              </main>
            </div>
          </ThemeProvider>
        </SessionProvider>
        <Toaster />
      </body>
    </html>
  );
}
