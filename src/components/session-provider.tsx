"use client"

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react"

/**
 * Session provider component that wraps the application to enable authentication state
 * @param props - Component properties including children
 */
export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>
} 