"use client"

import * as React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Phase, Task, Workflow } from "@prisma/client"
import { formatDistanceToNow } from "date-fns"
import { ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface PhasesTableProps {
  workflow: Workflow
  phases: (Phase & { tasks: Task[] })[]
  onPhaseChange: () => void
}

export function PhasesTable({
  workflow,
  phases,
  onPhaseChange,
}: PhasesTableProps) {
  const router = useRouter()
  const [expandedPhases, setExpandedPhases] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  const toggleExpand = (phaseId: string) => {
    setExpandedPhases((prev) =>
      prev.includes(phaseId)
        ? prev.filter((id) => id !== phaseId)
        : [...prev, phaseId]
    )
  }

  const handleDelete = async (phaseId: string) => {
    if (!confirm("Are you sure you want to delete this phase?")) return

    try {
      const response = await fetch(
        `/api/workflows/${workflow.id}/phases/${phaseId}`,
        {
          method: "DELETE",
        }
      )

      if (!response.ok) throw new Error("Failed to delete phase")

      onPhaseChange()
    } catch (error) {
      console.error("Error:", error)
      setError("Failed to delete phase")
    }
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
            <TableHead>Tasks</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[100px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {phases.map((phase) => (
            <React.Fragment key={phase.id}>
              <TableRow>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleExpand(phase.id)}
                  >
                    {expandedPhases.includes(phase.id) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </TableCell>
                <TableCell className="font-medium">{phase.name}</TableCell>
                <TableCell>{phase.tasks.length}</TableCell>
                <TableCell>
                  {formatDistanceToNow(new Date(phase.createdAt), {
                    addSuffix: true,
                  })}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(phase.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete phase</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              {expandedPhases.includes(phase.id) && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <div className="pl-12 py-4">
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-sm font-medium">Tasks</h3>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            router.push(
                              `/workflows/${workflow.id}/phases/${phase.id}/tasks`
                            )
                          }
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Manage Tasks
                        </Button>
                      </div>
                      {phase.tasks.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          No tasks yet. Click the button above to add tasks.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {phase.tasks.map((task) => (
                            <div
                              key={task.id}
                              className="flex items-center justify-between rounded-md border p-2"
                            >
                              <div>
                                <div className="font-medium">{task.name}</div>
                                {task.description && (
                                  <div className="text-sm text-muted-foreground">
                                    {task.description}
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="text-sm text-muted-foreground">
                                  {task.manHours}h
                                </div>
                              </div>
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
    </div>
  )
} 