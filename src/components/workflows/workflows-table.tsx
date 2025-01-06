"use client"

import * as React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Phase, Workflow } from "@prisma/client"
import { formatDistanceToNow } from "date-fns"
import { ChevronDown, ChevronRight, Edit, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { WorkflowModal } from "@/components/workflows/workflow-modal"

interface WorkflowsTableProps {
  workflows: (Workflow & { phases: Phase[] })[]
  isLoading: boolean
  onWorkflowChange: () => void
}

export function WorkflowsTable({
  workflows,
  isLoading,
  onWorkflowChange,
}: WorkflowsTableProps) {
  const router = useRouter()
  const [expandedWorkflows, setExpandedWorkflows] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const toggleExpand = (workflowId: string) => {
    setExpandedWorkflows((prev) =>
      prev.includes(workflowId)
        ? prev.filter((id) => id !== workflowId)
        : [...prev, workflowId]
    )
  }

  const handleEdit = (workflow: Workflow) => {
    setSelectedWorkflow(workflow)
    setModalOpen(true)
  }

  const handleDelete = async (workflowId: string) => {
    if (!confirm("Are you sure you want to delete this workflow?")) return

    try {
      const response = await fetch(`/api/workflows/${workflowId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete workflow")

      onWorkflowChange()
    } catch (error) {
      console.error("Error:", error)
      setError("Failed to delete workflow")
    }
  }

  const handleWorkflowSuccess = (workflow: Workflow) => {
    setModalOpen(false)
    setSelectedWorkflow(null)
    onWorkflowChange()
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/15 p-4 text-destructive">
          {error}
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]"></TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Phases</TableHead>
            <TableHead className="w-[100px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workflows.map((workflow) => (
            <React.Fragment key={workflow.id}>
              <TableRow>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleExpand(workflow.id)}
                  >
                    {expandedWorkflows.includes(workflow.id) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </TableCell>
                <TableCell className="font-medium">{workflow.name}</TableCell>
                <TableCell className="text-muted-foreground">{workflow.description || "No description"}</TableCell>
                <TableCell>{workflow.phases.length}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(workflow)}
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit workflow</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(workflow.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete workflow</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              {expandedWorkflows.includes(workflow.id) && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <div className="pl-12 py-4">
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-sm font-medium">Phases</h3>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/workflows/${workflow.id}/phases`)}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Manage Phases
                        </Button>
                      </div>
                      {workflow.phases.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          No phases yet. Click the button above to add phases.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {workflow.phases.map((phase) => (
                            <div
                              key={phase.id}
                              className="flex items-center justify-between rounded-md border p-2"
                            >
                              <span className="text-sm">{phase.name}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push(`/workflows/${workflow.id}/phases/${phase.id}/tasks`)}
                              >
                                View Tasks
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>

      <WorkflowModal
        workflow={selectedWorkflow}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSuccess={handleWorkflowSuccess}
      />
    </div>
  )
} 