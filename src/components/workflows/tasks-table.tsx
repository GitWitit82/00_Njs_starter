"use client"

import * as React from "react"
import { useState } from "react"
import { Phase, Task, Workflow } from "@prisma/client"
import { formatDistanceToNow } from "date-fns"
import { Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface TasksTableProps {
  phase: Phase & { workflow: Workflow }
  tasks: Task[]
  onTaskChange: () => void
}

export function TasksTable({ phase, tasks, onTaskChange }: TasksTableProps) {
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return

    try {
      const response = await fetch(
        `/api/workflows/${phase.workflow.id}/phases/${phase.id}/tasks/${taskId}`,
        {
          method: "DELETE",
        }
      )

      if (!response.ok) throw new Error("Failed to delete task")

      onTaskChange()
    } catch (error) {
      console.error("Error:", error)
      setError("Failed to delete task")
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-500"
      case "MEDIUM":
        return "bg-yellow-500"
      case "LOW":
        return "bg-green-500"
      default:
        return "bg-gray-500"
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
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Man Hours</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[100px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No tasks found. Click the button above to create one.
              </TableCell>
            </TableRow>
          ) : (
            tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell className="font-medium">{task.name}</TableCell>
                <TableCell>{task.description}</TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={`${getPriorityColor(task.priority)} text-white`}
                  >
                    {task.priority}
                  </Badge>
                </TableCell>
                <TableCell>{task.manHours}h</TableCell>
                <TableCell>
                  {formatDistanceToNow(new Date(task.createdAt), {
                    addSuffix: true,
                  })}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(task.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
} 