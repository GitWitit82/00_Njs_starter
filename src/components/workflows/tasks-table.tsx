"use client"

import { useState, useEffect } from "react"
import { Phase, Task, Workflow, Department } from "@prisma/client"
import { formatDistanceToNow } from "date-fns"
import { Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface TasksTableProps {
  workflow: Workflow
  phase: Phase
  tasks: Task[]
  onTaskChange: () => void
}

export function TasksTable({
  workflow,
  phase,
  tasks,
  onTaskChange,
}: TasksTableProps) {
  const [error, setError] = useState<string | null>(null)
  const [departments, setDepartments] = useState<Department[]>([])

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch("/api/departments")
        if (!response.ok) throw new Error("Failed to fetch departments")
        const data = await response.json()
        setDepartments(data)
      } catch (error) {
        console.error("Error:", error)
        setError("Failed to load departments")
      }
    }

    fetchDepartments()
  }, [])

  const handleDelete = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return

    try {
      const response = await fetch(
        `/api/workflows/${workflow.id}/phases/${phase.id}/tasks/${taskId}`,
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

  const getDepartmentColor = (departmentId: string | null) => {
    if (!departmentId) return null
    const department = departments.find((d) => d.id === departmentId)
    return department?.color || null
  }

  const getDepartmentName = (departmentId: string | null) => {
    if (!departmentId) return "No department"
    const department = departments.find((d) => d.id === departmentId)
    return department?.name || "Unknown department"
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
            <TableHead>Department</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Hours</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[100px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id}>
              <TableCell className="font-medium">{task.name}</TableCell>
              <TableCell>{task.description || "No description"}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {task.departmentId && (
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{
                        backgroundColor: getDepartmentColor(task.departmentId),
                      }}
                    />
                  )}
                  {getDepartmentName(task.departmentId)}
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    task.priority === "HIGH"
                      ? "destructive"
                      : task.priority === "MEDIUM"
                      ? "default"
                      : "secondary"
                  }
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
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(task.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete task</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 