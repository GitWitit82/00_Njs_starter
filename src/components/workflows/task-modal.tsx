/**
 * @file TaskModal Component
 * @description Modal for creating and editing workflow tasks
 */

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Task } from "@prisma/client"
import { toast } from "sonner"

interface TaskModalProps {
  task: Task | null
  isOpen: boolean
  onClose: () => void
  onSubmit: (taskId: string | undefined, data: Partial<Task>) => Promise<void>
  onDelete?: (taskId: string) => Promise<void>
  isLoading?: boolean
}

/**
 * TaskModal component for creating and editing tasks
 * @param {TaskModalProps} props - Component props
 * @returns {JSX.Element} Rendered component
 */
export function TaskModal({
  task,
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  isLoading = false,
}: TaskModalProps) {
  const [formData, setFormData] = useState<Partial<Task>>(
    task || {
      name: "",
      description: "",
      status: "todo",
      priority: "medium",
    }
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await onSubmit(task?.id, formData)
      toast.success(task ? "Task updated successfully" : "Task created successfully")
      onClose()
    } catch {
      toast.error(task ? "Failed to update task" : "Failed to create task")
    }
  }

  const handleDelete = async () => {
    if (!task?.id || !onDelete) return
    try {
      await onDelete(task.id)
      toast.success("Task deleted successfully")
      onClose()
    } catch {
      toast.error("Failed to delete task")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "Create Task"}</DialogTitle>
          <DialogDescription>
            {task
              ? "Make changes to the task here."
              : "Add a new task to the workflow."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                disabled={isLoading}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, status: value }))
                }
                disabled={isLoading}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, priority: value }))
                }
                disabled={isLoading}
              >
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            {task && onDelete && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isLoading}
              >
                Delete
              </Button>
            )}
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? task
                  ? "Updating..."
                  : "Creating..."
                : task
                ? "Update"
                : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 