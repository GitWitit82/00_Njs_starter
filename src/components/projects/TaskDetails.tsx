"use client";

/**
 * @file TaskDetails.tsx
 * @description Component for displaying task details, actions, and comments
 */

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
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
import { toast } from "sonner"

interface TaskDetailsProps {
  task: Task
  onUpdate: (data: TaskUpdateData) => Promise<void>
  isLoading?: boolean
}

interface Task {
  id: string
  name: string
  description: string
  status: string
  priority: string
  createdAt: string
  updatedAt: string
}

interface TaskUpdateData {
  name: string
  description: string
  status: string
  priority: string
}

/**
 * TaskDetails component for displaying and editing task details
 * @param {TaskDetailsProps} props - Component props
 * @returns {JSX.Element} Rendered component
 */
export function TaskDetails({
  task,
  onUpdate,
  isLoading = false,
}: TaskDetailsProps) {
  const [formData, setFormData] = useState<TaskUpdateData>({
    name: task.name,
    description: task.description,
    status: task.status,
    priority: task.priority,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await onUpdate(formData)
      toast.success("Task updated successfully")
    } catch {
      toast.error("Failed to update task")
    }
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="task-name">Task Name</Label>
          <Input
            id="task-name"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="Enter task name"
            disabled={isLoading}
            required
          />
        </div>
        <div>
          <Label htmlFor="task-description">Description</Label>
          <Textarea
            id="task-description"
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            placeholder="Enter task description"
            disabled={isLoading}
          />
        </div>
        <div>
          <Label htmlFor="task-status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, status: value }))
            }
            disabled={isLoading}
          >
            <SelectTrigger id="task-status">
              <SelectValue placeholder="Select task status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="done">Done</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="task-priority">Priority</Label>
          <Select
            value={formData.priority}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, priority: value }))
            }
            disabled={isLoading}
          >
            <SelectTrigger id="task-priority">
              <SelectValue placeholder="Select task priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Card>
  )
} 