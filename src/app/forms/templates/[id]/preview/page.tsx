import { Suspense } from "react"
import { db } from "@/lib/db"
import { FormPreview } from "@/components/forms/preview/FormPreview"
import { Department, FormTemplate, Workflow } from "@prisma/client"
import { notFound } from "next/navigation"

interface PageProps {
  params: {
    id: string
  }
}

interface FormTemplateWithRelations extends FormTemplate {
  department: Department | null
  workflow: Workflow | null
}

/**
 * Form template preview page - Server Component
 */
export default async function FormPreviewPage({
  params,
}: PageProps) {
  const { id } = params

  // Fetch template with relations
  const template = await db.formTemplate.findUnique({
    where: { id },
    include: {
      department: true,
      workflow: true,
    },
  })

  if (!template) {
    notFound()
  }

  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{template.name}</h1>
        {template.description && (
          <p className="text-muted-foreground mt-1">{template.description}</p>
        )}
      </div>
      <Suspense fallback={<div>Loading preview...</div>}>
        <FormPreview template={template} />
      </Suspense>
    </div>
  )
} 