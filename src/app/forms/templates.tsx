import { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { FormTemplatesWrapper } from "./templates-wrapper"

export const metadata: Metadata = {
  title: "Form Templates",
  description: "Manage form templates",
}

export default async function FormTemplatesPage() {
  const templates = await prisma.formTemplate.findMany({
    include: {
      department: {
        select: {
          id: true,
          name: true,
          color: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return (
    <div className="container mx-auto py-10">
      <FormTemplatesWrapper templates={templates} />
    </div>
  )
} 