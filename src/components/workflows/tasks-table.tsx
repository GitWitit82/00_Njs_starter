/**
 * @file TasksTable Component
 * @description Displays and manages tasks for a workflow phase
 */

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Priority, WorkflowTask } from "@prisma/client"
import { Plus, MoreHorizontal } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TaskModal } from "./task-modal"
import { WorkflowTaskWithDepartment } from "@/types/workflows"

interface TasksTableProps {
  workflowId: string
  phaseId: string
  tasks: WorkflowTaskWithDepartment[]
  isLoading?: boolean
}

/**
 * Gets the priority color class based on priority level
 */
function getPriorityColor(priority: Priority): string {
  switch (priority) {
    case Priority.LOW:
      return "text-green-500"
    case Priority.MEDIUM:
      return "text-yellow-500"
    case Priority.HIGH:
      return "text-orange-500"
    case Priority.URGENT:
      return "text-red-500"
    default:
      return "text-muted-foreground"
  }
}

/**
 * TasksTable component for displaying workflow tasks
 */
export function TasksTable({
  workflowId,
  phaseId,
  tasks,
  isLoading = false,
}: TasksTableProps) {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<WorkflowTaskWithDepartment | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  /**
   * Handles creating a new task
   */
  const handleCreateTask = async (_: undefined, data: Partial<WorkflowTask>) => {
    try {
      setIsSubmitting(true)
      const response = await fetch(
        `/api/workflows/${workflowId}/phases/${phaseId}/tasks`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: data.name,
            description: data.description,
            priority: data.priority || "MEDIUM",
            manHours: data.manHours || 0,
            departmentId: data.departmentId,
            order: tasks.length,
            status: "TODO", // Default status for new tasks
          }),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create task")
      }

      router.refresh()
      setModalOpen(false)
      toast.success("Task created successfully")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create task")
    } finally {
      setIsSubmitting(false)
    }
  }

  /**
   * Handles updating a task
   */
  const handleUpdateTask = async (taskId: string, data: Partial<WorkflowTask>) => {
    try {
      setIsSubmitting(true)
      const response = await fetch(
        `/api/workflows/${workflowId}/phases/${phaseId}/tasks/${taskId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: data.name,
            description: data.description,
            priority: data.priority,
            manHours: data.manHours,
            departmentId: data.departmentId,
          }),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update task")
      }

      router.refresh()
      setModalOpen(false)
      toast.success("Task updated successfully")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update task")
    } finally {
      setIsSubmitting(false)
    }
  }

  /**
   * Handles deleting a task
   */
  const handleDeleteTask = async (taskId: string) => {
    try {
      setIsSubmitting(true)
      const response = await fetch(
        `/api/workflows/${workflowId}/phases/${phaseId}/tasks/${taskId}`,
        {
          method: "DELETE",
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete task")
      }

      router.refresh()
      setModalOpen(false)
      toast.success("Task deleted successfully")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete task")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <div>Loading tasks...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setSelectedTask(null)
            setModalOpen(true)
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Task
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Hours</TableHead>
            <TableHead>Department</TableHead>
            <TableHead className="w-[70px]"></TableHead>
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
                <TableCell>{task.description || "—"}</TableCell>
                <TableCell>
                  <span className={getPriorityColor(task.priority)}>
                    {task.priority.toLowerCase()}
                  </span>
                </TableCell>
                <TableCell>{task.manHours || "—"}</TableCell>
                <TableCell>{task.department?.name || "—"}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedTask(task)
                          setModalOpen(true)
                        }}
                      >
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-destructive"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <TaskModal
        task={selectedTask}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={selectedTask ? handleUpdateTask : handleCreateTask}
        onDelete={selectedTask ? handleDeleteTask : undefined}
        isLoading={isSubmitting}
      />
    </div>
  )
} 