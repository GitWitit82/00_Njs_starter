import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppSidebar } from "@/components/AppSidebar";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import { ClientProviders } from "@/components/providers/ClientProviders";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Workflow PMS",
  description: "Project Management System with Workflow and Form Management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.className, "min-h-screen bg-background antialiased")}>
        <ClientProviders>
          <div className="relative flex min-h-screen">
            <AppSidebar />
            <main className="flex-1 overflow-y-auto">
              <div className="container mx-auto p-6">
                {children}
              </div>
            </main>
          </div>
          <Toaster />
        </ClientProviders>
      </body>
    </html>
  );
}
