import { Suspense } from "react"
import { notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db"
import { FormBuilder } from "@/components/forms/FormBuilder"
import { CustomDynamicForm } from "@/components/forms/CustomDynamicForm"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

/**
 * Form Template Page
 * Provides form building and preview functionality
 */
export default async function FormTemplatePage({ params }: FormTemplatePageProps) {
  const session = await getServerSession()
  const template = await getFormTemplate(params.id)

  const handleSave = async (updatedTemplate: any) => {
    "use server"
    
    await prisma.formTemplate.update({
      where: { id: params.id },
      data: updatedTemplate,
    })
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{template.name}</h1>
          <p className="text-gray-500">{template.description}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" asChild>
            <a href="/forms/templates">Back to Templates</a>
          </Button>
        </div>
      </div>

      <Card>
        <Tabs defaultValue="edit">
          <TabsList className="w-full">
            <TabsTrigger value="edit" className="flex-1">Edit Template</TabsTrigger>
            <TabsTrigger value="preview" className="flex-1">Preview Form</TabsTrigger>
            {template.type === "CUSTOM" && (
              <TabsTrigger value="dynamic" className="flex-1">Dynamic Preview</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="edit" className="p-4">
            <Suspense fallback={<div>Loading form builder...</div>}>
              <FormBuilder
                initialTemplate={template}
                onSave={handleSave}
              />
            </Suspense>
          </TabsContent>

          <TabsContent value="preview" className="p-4">
            <Suspense fallback={<div>Loading form preview...</div>}>
              <FormPreview
                template={template}
                onSubmit={async (data) => {
                  "use server"
                  
                  await prisma.formResponse.create({
                    data: {
                      templateId: template.id,
                      data,
                      status: "DRAFT",
                    },
                  })
                }}
              />
            </Suspense>
          </TabsContent>

          {template.type === "CUSTOM" && (
            <TabsContent value="dynamic" className="p-4">
              <Suspense fallback={<div>Loading dynamic form...</div>}>
                <CustomDynamicForm
                  template={template}
                  projectData={{
                    name: "Sample Project",
                    startDate: new Date().toISOString(),
                    status: "IN_PROGRESS",
                  }}
                  departmentData={{
                    name: template.department?.name,
                    color: template.department?.color,
                  }}
                  userData={{
                    name: session?.user?.name,
                    email: session?.user?.email,
                  }}
                  onChange={(data) => {
                    console.log("Form data changed:", data)
                  }}
                />
              </Suspense>
            </TabsContent>
          )}
        </Tabs>
      </Card>

      {/* Form Responses */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Recent Responses</h2>
        <Suspense fallback={<div>Loading responses...</div>}>
          <FormResponseList templateId={template.id} />
        </Suspense>
      </div>
    </div>
  )
}

/**
 * Form Response List Component
 */
async function FormResponseList({ templateId }: { templateId: string }) {
  const responses = await prisma.formResponse.findMany({
    where: { templateId },
    include: {
      submittedBy: {
        select: {
          name: true,
          email: true,
          image: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  })

  if (!responses.length) {
    return (
      <Card className="p-4">
        <p className="text-gray-500">No responses yet</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {responses.map((response) => (
        <Card key={response.id} className="p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                {response.submittedBy?.image && (
                  <img
                    src={response.submittedBy.image}
                    alt={response.submittedBy.name || ""}
                    className="w-6 h-6 rounded-full"
                  />
                )}
                <span className="font-medium">
                  {response.submittedBy?.name || "Anonymous"}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                {new Date(response.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <span
                className={cn(
                  "px-2 py-1 text-xs rounded-full",
                  response.status === "APPROVED" && "bg-green-100 text-green-800",
                  response.status === "REJECTED" && "bg-red-100 text-red-800",
                  response.status === "DRAFT" && "bg-gray-100 text-gray-800",
                  response.status === "SUBMITTED" && "bg-blue-100 text-blue-800"
                )}
              >
                {response.status}
              </span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
} 