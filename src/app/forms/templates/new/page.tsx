import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { FormBuilder } from "@/components/forms/FormBuilder"

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
 * Form template creation page that provides an interface for building new form templates
 */
export default async function NewFormTemplatePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

  const { workflows, departments } = await getWorkflowsAndDepartments()

  async function createFormTemplate(template: any) {
    "use server"

    const session = await getServerSession(authOptions)
    if (!session) {
      throw new Error("Unauthorized")
    }

    await prisma.formTemplate.create({
      data: {
        ...template,
        createdById: session.user.id,
        updatedById: session.user.id,
      },
    })

    redirect("/forms")
  }

  return (
    <div className="container py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Form Template</h1>
        <p className="text-muted-foreground">
          Design a new form template for your workflow
        </p>
      </div>

      <FormBuilder
        workflows={workflows}
        departments={departments}
        onSave={createFormTemplate}
      />
    </div>
  )
} 