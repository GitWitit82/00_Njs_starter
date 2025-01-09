import { Suspense } from "react"
import { db } from "@/lib/db"
import { FormBuilderWrapper } from "@/components/forms/builder/form-builder-wrapper"
import { Department, FormTemplate, Workflow, User } from "@prisma/client"
import { notFound } from "next/navigation"

interface PageProps {
  params: {
    id: string
  }
}

interface FormTemplateWithRelations extends FormTemplate {
  department: Department | null
  workflow: Workflow | null
  user: User
}

/**
 * Form template edit page - Server Component
 */
export default async function FormTemplatePage({
  params,
}: PageProps) {
  const { id } = params

  // Fetch template with relations
  const template = await db.formTemplate.findUnique({
    where: { id },
    include: {
      department: true,
      workflow: true,
      user: true,
    },
  })

  if (!template) {
    notFound()
  }

  // Fetch departments for dropdown
  const departments = await db.department.findMany({
    orderBy: { name: "asc" },
  })

  // Fetch workflows with phases for dropdown
  const workflows = await db.workflow.findMany({
    include: {
      phases: {
        orderBy: { order: "asc" },
      },
    },
    orderBy: { name: "asc" },
  })

  return (
    <div className="container py-6">
      <Suspense fallback={<div>Loading preview...</div>}>
        <FormBuilderWrapper
          template={template}
          departments={departments}
          workflows={workflows}
        />
      </Suspense>
    </div>
  )
} 