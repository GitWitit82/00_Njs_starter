import { db } from "@/lib/db"
import { FormBuilder } from "@/components/forms/FormBuilder"
import { Department, FormTemplate, Workflow } from "@prisma/client"

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
  // Fetch form template
  const template = await db.formTemplate.findUnique({
    where: { id: params.id },
    include: {
      department: true,
      phase: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })

  if (!template) {
    return <div>Template not found</div>
  }

  // Fetch departments
  const departments = await db.department.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      createdAt: true,
      updatedAt: true,
      color: true,
    },
  })

  // Fetch workflows with phases
  const workflows = await db.workflow.findMany({
    include: {
      phases: {
        select: {
          id: true,
          name: true,
          description: true,
          createdAt: true,
          updatedAt: true,
          order: true,
          workflowId: true,
        },
      },
    },
  })

  return (
    <FormBuilder
      initialData={template}
      departments={departments}
      workflows={workflows}
    />
  )
} 