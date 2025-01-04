"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Phase, Task, Workflow } from "@prisma/client"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { TasksTable } from "@/components/workflows/tasks-table"
import { TaskModal } from "@/components/workflows/task-modal"

type PhaseWithTasks = Phase & {
  tasks: Task[]
  workflow: Workflow
}

export default function TasksPage() {
  const params = useParams()
  const [phase, setPhase] = useState<PhaseWithTasks | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const fetchPhase = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch(
        `/api/workflows/${params.workflowId}/phases/${params.phaseId}`
      )
      if (!response.ok) throw new Error("Failed to fetch phase")
      const data = await response.json()
      setPhase(data)
    } catch (error) {
      console.error("Error:", error)
      setError("Failed to load phase")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (params.workflowId && params.phaseId) {
      fetchPhase()
    }
  }, [params.workflowId, params.phaseId])

  const handleTaskSuccess = (task: Task) => {
    setModalOpen(false)
    fetchPhase()
  }

  if (isLoading) {
    return (
      <div className="flex h-[450px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Loading tasks...</h2>
          <p className="text-sm text-muted-foreground">
            Please wait while we fetch the task data.
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

  if (!phase || !phase.workflow) {
    return (
      <div className="flex h-[450px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Not Found</h2>
          <p className="text-sm text-muted-foreground">
            The requested phase could not be found.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-6">
      <div className="mb-8">
        <Breadcrumb
          items={[
            { title: "Workflows", href: "/workflows" },
            { title: phase.workflow.name, href: `/workflows/${phase.workflow.id}` },
            {
              title: "Phases",
              href: `/workflows/${phase.workflow.id}/phases`,
            },
            { title: phase.name },
          ]}
        />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{phase.name} - Tasks</h1>
            <p className="text-muted-foreground">
              Manage tasks for this phase.
            </p>
          </div>
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Button>
        </div>
      </div>

      <TasksTable
        workflow={phase.workflow}
        phase={phase}
        tasks={phase.tasks}
        onTaskChange={fetchPhase}
      />

      <TaskModal
        workflowId={phase.workflow.id}
        phaseId={phase.id}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSuccess={handleTaskSuccess}
      />
    </div>
  )
} 