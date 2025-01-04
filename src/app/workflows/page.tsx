"use client"

import { useEffect, useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { WorkflowsTable } from "@/components/workflows/workflows-table"
import { WorkflowModal } from "@/components/workflows/workflow-modal"
import { useAuth } from "@/hooks/use-auth"
import { Workflow } from "@prisma/client"

/**
 * Workflows page component for managing workflow templates
 */
export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Ensure user has required permissions
  useAuth({ requiredRole: "ADMIN" })

  // Fetch workflows
  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        const response = await fetch("/api/workflows")
        if (!response.ok) throw new Error("Failed to fetch workflows")
        const data = await response.json()
        setWorkflows(data)
      } catch (error) {
        setError("Failed to load workflows")
        console.error("Error:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchWorkflows()
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Workflows</h1>
          <p className="text-muted-foreground">
            Create and manage workflow templates for your projects.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Workflow
        </Button>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/15 p-4 text-destructive">
          {error}
        </div>
      )}

      <WorkflowsTable
        workflows={workflows}
        isLoading={isLoading}
        setWorkflows={setWorkflows}
      />

      <WorkflowModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSuccess={(workflow) => {
          setWorkflows((prev) => [workflow, ...prev])
          setIsModalOpen(false)
        }}
      />
    </div>
  )
} 