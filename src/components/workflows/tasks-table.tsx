/**
 * @file TasksTable Component
 * @description Displays and manages tasks for a workflow phase
 */

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Priority } from "@prisma/client"
import { Plus, MoreHorizontal } from "lucide-react"

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
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<WorkflowTaskWithDepartment | undefined>(undefined)

  /**
   * Handles editing a task
   */
  const handleEditClick = (task: WorkflowTaskWithDepartment) => {
    setSelectedTask(task)
    setModalOpen(true)
  }

  /**
   * Handles creating a new task
   */
  const handleNewTask = () => {
    setSelectedTask(undefined)
    setModalOpen(true)
  }

  /**
   * Handles deleting a task
   */
  const handleDeleteTask = async (taskId: string) => {
    try {
      const response = await fetch(
        `/api/workflows/${workflowId}/phases/${phaseId}/tasks/${taskId}`,
        {
          method: "DELETE",
        }
      )

      if (!response.ok) {
        throw new Error("Failed to delete task")
      }

      router.refresh()
    } catch (error) {
      console.error("Error deleting task:", error)
      setError("Failed to delete task. Please try again.")
    }
  }

  if (isLoading) {
    return <div>Loading tasks...</div>
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/15 p-4 text-destructive">
          {error}
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={handleNewTask}>
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
                      <DropdownMenuItem onClick={() => handleEditClick(task)}>
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
        workflowId={workflowId}
        phaseId={phaseId}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        task={selectedTask}
      />
    </div>
  )
} 