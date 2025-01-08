import { prisma } from "@/lib/prisma"

export async function getDepartments() {
  const departments = await prisma.department.findMany({
    select: {
      id: true,
      name: true,
      color: true,
    },
  })
  return departments
} 