"use client"

import { useEffect, useState } from "react"
import { Workflow } from "@prisma/client"
import { Plus } from "lucide-react"

import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { WorkflowsTable } from "@/components/workflows/workflows-table"
import { WorkflowModal } from "@/components/workflows/workflow-modal"

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const { isAuthenticated } = useAuth({ requiredRole: "MANAGER" })

  const fetchWorkflows = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/workflows")
      if (!response.ok) throw new Error("Failed to fetch workflows")
      const data = await response.json()
      setWorkflows(data)
    } catch (error) {
      console.error("Error:", error)
      setError("Failed to load workflows")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchWorkflows()
    }
  }, [isAuthenticated])

  const handleWorkflowSuccess = (workflow: Workflow) => {
    setModalOpen(false)
    fetchWorkflows()
  }

  if (isLoading) {
    return (
      <div className="flex h-[450px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Loading workflows...</h2>
          <p className="text-sm text-muted-foreground">
            Please wait while we fetch the workflow data.
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[450px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-destructive">Error</h2>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-6">
      <div className="mb-8">
        <Breadcrumb
          items={[
            { title: "Workflows", href: "/workflows" }
          ]}
        />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Workflows</h1>
            <p className="text-muted-foreground">
              Create and manage workflow templates.
            </p>
          </div>
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Workflow
          </Button>
        </div>
      </div>

      <WorkflowsTable
        workflows={workflows}
        isLoading={isLoading}
        onWorkflowChange={fetchWorkflows}
      />

      <WorkflowModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSuccess={handleWorkflowSuccess}
      />
    </div>
  )
} 