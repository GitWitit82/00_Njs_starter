import { Metadata } from "next"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { DepartmentsClient } from "./client"

export const metadata: Metadata = {
  title: "Departments",
  description: "Manage departments and their settings",
}

export default async function DepartmentsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return null // This will trigger the auth middleware redirect
  }

  const departments = await db.department.findMany({
    orderBy: {
      createdAt: "desc",
    },
  })

  return <DepartmentsClient initialDepartments={departments} />
} 