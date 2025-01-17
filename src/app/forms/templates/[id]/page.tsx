import { Metadata } from "next"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { FormBuilder } from "@/components/forms/builder/FormBuilder"

export const metadata: Metadata = {
  title: "Edit Form Template",
  description: "Edit a form template",
}

interface PageProps {
  params: {
    id: string
  }
}

export default async function EditFormTemplatePage({ params }: PageProps) {
  const template = await prisma.formTemplate.findUnique({
    where: { id: params.id },
    include: {
      versions: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  })

  if (!template) {
    notFound()
  }

  return (
    <div className="container mx-auto py-10">
      <FormBuilder
        templateId={template.id}
        initialData={template.versions[0]?.schema || null}
      />
    </div>
  )
} 