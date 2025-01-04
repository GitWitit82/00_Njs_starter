"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Phase, Workflow } from "@prisma/client"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { PhasesTable } from "@/components/workflows/phases-table"
import { PhasesModal } from "@/components/workflows/phases-modal"

type WorkflowWithPhases = Workflow & {
  phases: Phase[]
}

export default function PhasesPage() {
  const params = useParams()
  const [workflow, setWorkflow] = useState<WorkflowWithPhases | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const fetchWorkflow = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/workflows/${params.workflowId}`)
      if (!response.ok) throw new Error("Failed to fetch workflow")
      const data = await response.json()
      setWorkflow(data)
    } catch (error) {
      console.error("Error:", error)
      setError("Failed to load workflow")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchWorkflow()
  }, [params.workflowId])

  const handlePhaseSuccess = () => {
    setModalOpen(false)
    fetchWorkflow()
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!workflow) {
    return <div>Workflow not found</div>
  }

  return (
    <div className="container py-6">
      <div className="mb-8">
        <Breadcrumb
          items={[
            { title: "Workflows", href: "/workflows" },
            { title: workflow.name, href: `/workflows/${workflow.id}` },
            { title: "Phases" }
          ]}
        />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{workflow.name} - Phases</h1>
            <p className="text-muted-foreground">
              Manage phases for this workflow.
            </p>
          </div>
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Phase
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-destructive/15 p-4 text-destructive">
          {error}
        </div>
      )}

      <PhasesTable
        workflow={workflow}
        phases={workflow.phases}
        onPhaseChange={fetchWorkflow}
      />

      <PhasesModal
        workflow={workflow}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSuccess={handlePhaseSuccess}
      />
    </div>
  )
} 