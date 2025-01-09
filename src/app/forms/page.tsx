import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import FormTemplates from "./templates"
import FormInstances from "./instances"

/**
 * Main Forms page component
 * Provides tabbed interface for managing form templates and instances
 * @returns React.FC
 */
export default function FormsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Forms</h1>
          <p className="text-muted-foreground">
            Manage form templates and responses for your workflows
          </p>
        </div>
        <div className="space-x-2">
          <Link href="/forms/templates/new">
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="templates">
        <TabsList>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="instances">Instances</TabsTrigger>
        </TabsList>

        <TabsContent value="templates">
          <Suspense fallback={<div>Loading templates...</div>}>
            <FormTemplates />
          </Suspense>
        </TabsContent>

        <TabsContent value="instances">
          <Suspense fallback={<div>Loading instances...</div>}>
            <FormInstances />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
} 