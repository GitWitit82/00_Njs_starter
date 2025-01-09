import { Suspense } from "react"
import { db } from "@/lib/db"
import { FormBuilderWrapper } from "@/components/forms/builder/form-builder-wrapper"
import { Department, FormTemplate, Workflow, User } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

interface FormTemplateWithRelations extends FormTemplate {
  department: Department | null
  workflow: Workflow | null
  user: User
}

/**
 * New form template page - Server Component
 */
export default async function NewFormTemplatePage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/auth/login')
  }

  // Get the current user
  const user = await db.user.findUnique({
    where: { email: session.user.email! }
  })

  if (!user) {
    redirect('/auth/login')
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

  // Create empty template
  const emptyTemplate: FormTemplateWithRelations = {
    id: '',
    name: '',
    description: '',
    schema: { sections: [] },
    departmentId: null,
    workflowId: null,
    phaseId: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: user.id,
    department: null,
    workflow: null,
    user,
  }

  return (
    <div className="container py-6">
      <Suspense fallback={<div>Loading preview...</div>}>
        <FormBuilderWrapper
          template={emptyTemplate}
          departments={departments}
          workflows={workflows}
          isNew={true}
        />
      </Suspense>
    </div>
  )
} 