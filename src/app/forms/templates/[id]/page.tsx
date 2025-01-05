import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { FormBuilder } from "@/components/forms/FormBuilder"
import { notFound } from "next/navigation"

interface FormTemplatePageProps {
  params: {
    id: string
  }
}

async function getFormTemplate(id: string) {
  const template = await prisma.formTemplate.findUnique({
    where: { id },
    include: {
      department: true,
      phase: {
        include: {
          workflow: true,
        },
      },
    },
  })

  if (!template) {
    notFound()
  }

  return template
}

async function getWorkflowsAndDepartments() {
  const [workflows, departments] = await Promise.all([
    prisma.workflow.findMany({
      include: {
        phases: true,
      },
      orderBy: {
        name: "asc",
      },
    }),
    prisma.department.findMany({
      orderBy: {
        name: "asc",
      },
    }),
  ])

  return { workflows, departments }
}

/**
 * Form template edit page that allows users to modify existing templates
 */
export default async function FormTemplatePage({ params }: FormTemplatePageProps) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

  const [template, { workflows, departments }] = await Promise.all([
    getFormTemplate(params.id),
    getWorkflowsAndDepartments(),
  ])

  async function updateFormTemplate(updatedTemplate: any) {
    "use server"

    const session = await getServerSession(authOptions)
    if (!session) {
      throw new Error("Unauthorized")
    }

    await prisma.formTemplate.update({
      where: { id: params.id },
      data: {
        ...updatedTemplate,
        updatedById: session.user.id,
      },
    })

    redirect("/forms")
  }

  return (
    <div className="container py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Form Template</h1>
        <p className="text-muted-foreground">
          Modify the form template settings and layout
        </p>
      </div>

      <FormBuilder
        initialTemplate={template}
        workflows={workflows}
        departments={departments}
        onSave={updateFormTemplate}
      />
    </div>
  )
} 