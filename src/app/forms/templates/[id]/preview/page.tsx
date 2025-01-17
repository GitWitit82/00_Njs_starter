import { Metadata } from "next"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { FormPreview } from "@/components/forms/preview/FormPreview"

export const metadata: Metadata = {
  title: "Preview Form Template",
  description: "Preview a form template",
}

interface PageProps {
  params: {
    id: string
  }
}

export default async function PreviewFormTemplatePage({ params }: PageProps) {
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
      <FormPreview schema={template.versions[0]?.schema || null} />
    </div>
  )
} 