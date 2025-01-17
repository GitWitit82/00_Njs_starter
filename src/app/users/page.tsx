import { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { UsersTable } from "@/components/users/users-table"

export const metadata: Metadata = {
  title: "Users",
  description: "Manage system users",
}

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
  })

  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-8 text-3xl font-bold">Users</h1>
      <UsersTable users={users} />
    </div>
  )
} 