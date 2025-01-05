import { Suspense } from "react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { FormTemplateList } from "@/components/forms/FormTemplateList"
import { PlusIcon } from "lucide-react"
import Link from "next/link"

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

/**
 * Forms page displays a list of form templates and provides options to create new templates
 */
export default async function FormsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

  const templates = await getFormTemplates()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Forms</h1>
          <p className="text-muted-foreground">
            Manage form templates and responses for your workflows
          </p>
        </div>
        <Link href="/forms/templates/new">
          <Button>
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </Link>
      </div>

      <Suspense fallback={<div>Loading templates...</div>}>
        <FormTemplateList templates={templates} />
      </Suspense>
    </div>
  )
} 