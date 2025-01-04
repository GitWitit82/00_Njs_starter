import { Role } from "@prisma/client"
import "next-auth"
import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name: string
      role: Role
    }
  }

  interface User {
    id: string
    name: string
    role: Role
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    name: string
    role: Role
  }
} 