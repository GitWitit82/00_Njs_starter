"use client"

import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Phase, Task, Workflow } from "@prisma/client"
import { GripVertical, Plus, Trash2 } from "lucide-react"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const taskSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  manHours: z.number().min(0).optional(),
})

type FormData = z.infer<typeof taskSchema>

interface TasksModalProps {
  workflow: Workflow | null
  phase: Phase | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

type PhaseWithTasks = Phase & {
  tasks: Task[]
}

/**
 * Modal component for managing phase tasks
 */
export function TasksModal({
  workflow,
  phase,
  open,
  onOpenChange,
}: TasksModalProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<FormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      name: "",
      description: "",
      priority: "MEDIUM",
      manHours: 0,
    },
  })

  // Fetch tasks when phase changes
  useEffect(() => {
    const fetchTasks = async () => {
      if (!workflow || !phase) return

      try {
        setIsLoading(true)
        const response = await fetch(`/api/workflows/${workflow.id}/phases/${phase.id}`)
        if (!response.ok) throw new Error("Failed to fetch tasks")
        
        const data: PhaseWithTasks = await response.json()
        setTasks(data.tasks)
      } catch (error) {
        console.error("Error:", error)
        setError("Failed to load tasks")
      } finally {
        setIsLoading(false)
      }
    }

    fetchTasks()
  }, [workflow, phase])

  const onSubmit = async (values: FormData) => {
    if (!workflow || !phase) return

    try {
      setIsLoading(true)
      const response = await fetch(
        `/api/workflows/${workflow.id}/phases/${phase.id}/tasks`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        }
      )

      if (!response.ok) throw new Error("Failed to create task")

      const newTask = await response.json()
      setTasks((prev) => [...prev, newTask])
      form.reset()
    } catch (error) {
      console.error("Error:", error)
      setError("Failed to create task")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (taskId: string) => {
    if (!workflow || !phase) return
    if (!confirm("Are you sure you want to delete this task?")) return

    try {
      setIsLoading(true)
      const response = await fetch(
        `/api/workflows/${workflow.id}/phases/${phase.id}/tasks/${taskId}`,
        {
          method: "DELETE",
        }
      )

      if (!response.ok) throw new Error("Failed to delete task")

      setTasks((prev) => prev.filter((task) => task.id !== taskId))
    } catch (error) {
      console.error("Error:", error)
      setError("Failed to delete task")
    } finally {
      setIsLoading(false)
    }
  }

  const handleReorder = async (draggedId: string, targetId: string) => {
    if (!workflow || !phase) return

    const draggedIndex = tasks.findIndex((task) => task.id === draggedId)
    const targetIndex = tasks.findIndex((task) => task.id === targetId)
    
    if (draggedIndex === -1 || targetIndex === -1) return

    const newTasks = [...tasks]
    const [draggedTask] = newTasks.splice(draggedIndex, 1)
    newTasks.splice(targetIndex, 0, draggedTask)

    // Update order in UI immediately
    setTasks(newTasks)

    try {
      const response = await fetch(
        `/api/workflows/${workflow.id}/phases/${phase.id}/tasks/reorder`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tasks: newTasks.map((task, index) => ({
              id: task.id,
              order: index,
            })),
          }),
        }
      )

      if (!response.ok) throw new Error("Failed to reorder tasks")
    } catch (error) {
      console.error("Error:", error)
      setError("Failed to reorder tasks")
      // Revert to original order on error
      setTasks(tasks)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Tasks</DialogTitle>
          <DialogDescription>
            Add, remove, and reorder tasks for this phase.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/15 p-4 text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Current Tasks</h3>
            {tasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No tasks yet. Add your first task below.
              </p>
            ) : (
              <div className="space-y-2">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-2 rounded-md border p-2"
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData("text/plain", task.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault()
                      const draggedId = e.dataTransfer.getData("text/plain")
                      handleReorder(draggedId, task.id)
                    }}
                  >
                    <GripVertical className="h-4 w-4 cursor-move text-muted-foreground" />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{task.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {task.priority}
                        </span>
                      </div>
                      {task.description && (
                        <p className="text-sm text-muted-foreground">
                          {task.description}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(task.id)}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete task</span>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t pt-4">
            <h3 className="mb-4 text-sm font-medium">Add New Task</h3>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter task name"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter task description"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-4">
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Priority</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={isLoading}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="LOW">Low</SelectItem>
                            <SelectItem value="MEDIUM">Medium</SelectItem>
                            <SelectItem value="HIGH">High</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="manHours"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Estimated Hours</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.5"
                            placeholder="Enter estimated hours"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={isLoading}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Task
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 