"use client"

import { useState } from "react"
import { Edit2, Trash2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Workflow } from "@prisma/client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { WorkflowModal } from "./workflow-modal"

interface WorkflowsTableProps {
  workflows: Workflow[]
  isLoading: boolean
  setWorkflows: (workflows: Workflow[]) => void
}

/**
 * Table component for displaying and managing workflows
 */
export function WorkflowsTable({
  workflows,
  isLoading,
  setWorkflows,
}: WorkflowsTableProps) {
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this workflow?")) return

    try {
      setIsDeleting(true)
      const response = await fetch(`/api/workflows/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete workflow")

      setWorkflows(workflows.filter((workflow) => workflow.id !== id))
    } catch (error) {
      console.error("Error:", error)
      alert("Failed to delete workflow")
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return <div>Loading workflows...</div>
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workflows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No workflows found. Create your first workflow to get started.
                </TableCell>
              </TableRow>
            ) : (
              workflows.map((workflow) => (
                <TableRow key={workflow.id}>
                  <TableCell className="font-medium">{workflow.name}</TableCell>
                  <TableCell>{workflow.description || "No description"}</TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(workflow.createdAt), {
                      addSuffix: true,
                    })}
                  </TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(workflow.updatedAt), {
                      addSuffix: true,
                    })}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedWorkflow(workflow)
                          setIsModalOpen(true)
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                        <span className="sr-only">Edit workflow</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={isDeleting}
                        onClick={() => handleDelete(workflow.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete workflow</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <WorkflowModal
        workflow={selectedWorkflow}
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open)
          if (!open) setSelectedWorkflow(null)
        }}
        onSuccess={(updatedWorkflow) => {
          setWorkflows(
            workflows.map((w) =>
              w.id === updatedWorkflow.id ? updatedWorkflow : w
            )
          )
          setIsModalOpen(false)
          setSelectedWorkflow(null)
        }}
      />
    </>
  )
} 