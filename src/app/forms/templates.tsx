import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import { FormTemplateList } from "@/components/forms/templates/FormTemplateList"
import { FormTemplateListWrapper } from "./templates-wrapper"

async function getFormTemplates() {
  return prisma.formTemplate.findMany({
    include: {
      department: true,
      phase: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  })
}

export default async function FormTemplates() {
  const templates = await getFormTemplates()
  return <FormTemplateListWrapper templates={templates} />
} 