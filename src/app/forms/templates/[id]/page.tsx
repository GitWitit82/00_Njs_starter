import { db } from "@/lib/db"
import { FormBuilder } from "@/components/forms/FormBuilder"
import { Department, FormTemplate, Workflow } from "@prisma/client"
import { notFound } from "next/navigation"

interface PageProps {
  params: {
    id: string
  }
}

interface WorkflowWithPhases extends Workflow {
  phases: {
    id: string
    name: string
    description: string | null
    createdAt: Date
    updatedAt: Date
    order: number
    workflowId: string
  }[]
}

interface DepartmentData extends Omit<Department, "userId"> {
  color: string
}

interface FormBuilderProps {
  initialData: FormTemplate & {
    department: Department | null
    phase: {
      id: string
      name: string
    }
  } | null
  departments: DepartmentData[]
  workflows: WorkflowWithPhases[]
}

/**
 * Edit form template page
 */
export default async function EditFormTemplatePage({ params }: PageProps) {
  const id = await Promise.resolve(params.id)

  if (!id) {
    notFound()
  }

  const [template, departments, workflows] = await Promise.all([
    db.formTemplate.findUnique({
      where: { id },
      include: {
        department: true,
        phase: true,
        workflow: true,
      },
    }),
    db.department.findMany({
      orderBy: { name: "asc" },
    }),
    db.workflow.findMany({
      include: {
        phases: {
          orderBy: { order: "asc" },
        },
      },
      orderBy: { name: "asc" },
    }),
  ])

  if (!template) {
    notFound()
  }

  return (
    <FormBuilder
      departments={departments}
      workflows={workflows}
      initialData={template}
    />
  )
} 