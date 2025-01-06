"use client"

import { useEffect, useState } from "react"
import { Phase, Priority, Task, Workflow, Department } from "@prisma/client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

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

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  manHours: z.number().min(0.25, "Minimum 0.25 hours").step(0.25),
  departmentId: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface TaskModalProps {
  phase: Phase & { workflow: Workflow }
  task?: Task & { department?: Department | null }
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function TaskModal({
  phase,
  task,
  open,
  onOpenChange,
  onSuccess,
}: TaskModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [departments, setDepartments] = useState<Department[]>([])

  const isEditing = !!task

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      priority: "MEDIUM",
      manHours: 1,
      departmentId: undefined,
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
    } else {
      form.reset({
        name: "",
        description: "",
        priority: "MEDIUM",
        manHours: 1,
        departmentId: undefined,
      })
    }
  }, [task, form])

  // Fetch departments
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

  const onSubmit = async (values: FormData) => {
    try {
      setIsLoading(true)
      setError(null)

      const url = isEditing
        ? `/api/workflows/${phase.workflow.id}/phases/${phase.id}/tasks/${task.id}`
        : `/api/workflows/${phase.workflow.id}/phases/${phase.id}/tasks`

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) throw new Error(isEditing ? "Failed to update task" : "Failed to create task")

      form.reset()
      onSuccess()
    } catch (error) {
      console.error("Error:", error)
      setError(isEditing ? "Failed to update task" : "Failed to create task")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Task" : "Create Task"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Make changes to your task." : `Add a new task to the ${phase.name} phase.`}
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
                    <Input placeholder="Enter task name" {...field} />
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
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
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
                render={({ field: { onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Man Hours</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.25"
                        min="0.25"
                        placeholder="Enter estimated hours"
                        {...field}
                        value={field.value?.toString() || ""}
                        onChange={(e) => {
                          const value = e.target.value === "" ? 0 : parseFloat(e.target.value)
                          onChange(isNaN(value) ? 0 : value)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                          <div className="flex items-center gap-2">
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: department.color }}
                            />
                            {department.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (isEditing ? "Updating..." : "Creating...") : (isEditing ? "Update Task" : "Create Task")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 