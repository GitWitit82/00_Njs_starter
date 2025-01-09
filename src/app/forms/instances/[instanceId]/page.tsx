import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { FormStatusOverview } from "@/components/forms/FormStatusOverview"
import { FormResponse } from "@/components/forms/FormResponse"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface PageProps {
  params: {
    instanceId: string
  }
}

/**
 * Form instance details page
 */
export default async function FormInstancePage({ params }: PageProps) {
  const instance = await db.formInstance.findUnique({
    where: { id: params.instanceId },
    include: {
      template: {
        include: {
          department: true,
          workflow: true,
          phase: true
        }
      },
      project: true,
      responses: {
        orderBy: { createdAt: "desc" },
        take: 1
      }
    }
  })

  if (!instance) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{instance.template.name}</h1>
        <p className="text-muted-foreground">
          {instance.template.description || "No description provided"}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Details</h2>
          <dl className="space-y-2">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Department</dt>
              <dd>{instance.template.department?.name || "N/A"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Workflow</dt>
              <dd>{instance.template.workflow?.name || "N/A"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Phase</dt>
              <dd>{instance.template.phase?.name || "N/A"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Project</dt>
              <dd>{instance.project?.name || "N/A"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Status</dt>
              <dd>{instance.status}</dd>
            </div>
          </dl>
        </Card>

        <Card className="p-6">
          <FormStatusOverview
            formId={instance.id}
            projectId={instance.projectId}
            initialStatus={instance.status}
          />
        </Card>
      </div>

      <Card className="p-6">
        <Tabs defaultValue="current">
          <TabsList>
            <TabsTrigger value="current">Current Response</TabsTrigger>
            <TabsTrigger value="history">Response History</TabsTrigger>
          </TabsList>
          <TabsContent value="current">
            <FormResponse
              instance={instance}
              response={instance.responses[0]}
              template={instance.template}
            />
          </TabsContent>
          <TabsContent value="history">
            {/* Add FormResponseHistory component here */}
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
} 