/**
 * @file TaskModal Component
 * @description Modal for creating and editing workflow tasks
 */

"use client"

import { useEffect, useState } from "react"
import { Department } from "@prisma/client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

const taskSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  manHours: z.number().min(0.25, "Minimum 0.25 hours").max(100, "Maximum 100 hours"),
  departmentId: z.string().optional(),
})

type TaskFormValues = z.infer<typeof taskSchema>

interface TaskModalProps {
  workflowId: string
  phaseId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  task?: TaskWithDepartment
}

export function TaskModal({
  workflowId,
  phaseId,
  open,
  onOpenChange,
  onSuccess,
  task,
}: TaskModalProps) {
  const [departments, setDepartments] = useState<Department[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      name: task?.name || "",
      description: task?.description || "",
      priority: task?.priority || "MEDIUM",
      manHours: task?.manHours || 1,
      departmentId: task?.departmentId || undefined,
    },
  })

  // Reset form when task changes
  useEffect(() => {
    if (task) {
      form.reset({
        name: task.name,
        description: task.description || "",
        priority: task.priority,
        manHours: task.manHours,
        departmentId: task.departmentId || undefined,
      })
    }
  }, [task, form])

  // Fetch departments when modal opens
  useEffect(() => {
    if (open) {
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
    }
  }, [open])

  const onSubmit = async (data: TaskFormValues) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const url = `/api/workflows/${workflowId}/phases/${phaseId}/tasks${task ? `/${task.id}` : ""}`
      const method = task ? "PUT" : "POST"
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error(`Failed to ${task ? "update" : "create"} task`)

      onSuccess()
      if (!task) form.reset() // Only reset form on create, not edit
    } catch (error) {
      console.error("Error:", error)
      setError(`Failed to ${task ? "update" : "create"} task`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{task ? "Edit" : "Create"} Task</DialogTitle>
          <DialogDescription>
            {task ? "Edit the task details below." : "Add a new task to this phase. Fill in the details below."}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-md bg-destructive/15 p-4 text-destructive">
            {error}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Task name" {...field} />
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
                      placeholder="Task description"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
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
                <FormItem>
                  <FormLabel>Man Hours</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.25"
                      min="0.25"
                      max="100"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Estimated hours required for this task
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="departmentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {departments.map((department) => (
                        <SelectItem key={department.id} value={department.id}>
                          {department.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Department responsible for this task
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  "Loading..."
                ) : task ? (
                  "Save Changes"
                ) : (
                  "Create Task"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 