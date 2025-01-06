/**
 * @file TasksTable Component
 * @description Displays and manages tasks for a workflow phase
 */

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Department, Task } from "@prisma/client"
import { Plus, Pencil } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TaskModal } from "./task-modal"

interface TaskWithDepartment extends Task {
  department: Department | null
}

interface TasksTableProps {
  workflowId: string
  phaseId: string
  tasks: TaskWithDepartment[]
  isLoading?: boolean
}

export function TasksTable({
  workflowId,
  phaseId,
  tasks,
  isLoading = false,
}: TasksTableProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<TaskWithDepartment | undefined>(undefined)

  const handleTaskSuccess = () => {
    setModalOpen(false)
    setSelectedTask(undefined)
    router.refresh()
  }

  const handleEditClick = (task: TaskWithDepartment) => {
    setSelectedTask(task)
    setModalOpen(true)
  }

  const handleNewTask = () => {
    setSelectedTask(undefined)
    setModalOpen(true)
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
            <TableHead>Department</TableHead>
            <TableHead>Man Hours</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center">
                No tasks found. Click the button above to create one.
              </TableCell>
            </TableRow>
          ) : (
            tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell className="font-medium">{task.name}</TableCell>
                <TableCell>{task.description}</TableCell>
                <TableCell>{task.priority}</TableCell>
                <TableCell>{task.department?.name || "Unassigned"}</TableCell>
                <TableCell>{task.manHours}h</TableCell>
                <TableCell>
                  {formatDistanceToNow(new Date(task.createdAt), {
                    addSuffix: true,
                  })}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditClick(task)}
                    className="h-8 w-8 p-0"
                  >
                    <span className="sr-only">Edit task</span>
                    <Pencil className="h-4 w-4" />
                  </Button>
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
        onOpenChange={setModalOpen}
        onSuccess={handleTaskSuccess}
        task={selectedTask}
      />
    </div>
  )
} 