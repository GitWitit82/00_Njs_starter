/**
 * @file TaskModal Component
 * @description Modal for creating and editing workflow tasks
 */

"use client"

import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Priority, WorkflowTask, Department } from "@prisma/client"
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
import { WorkflowTaskWithDepartment } from "@/types/workflows"

const taskSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  priority: z.nativeEnum(Priority),
  manHours: z.number().min(0).optional(),
  departmentId: z.string().optional(),
})

type FormData = z.infer<typeof taskSchema>

interface TaskModalProps {
  task: WorkflowTaskWithDepartment | null
  isOpen: boolean
  onClose: () => void
  onSubmit: (taskId: string | undefined, data: Partial<WorkflowTask>) => Promise<void>
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
  const [departments, setDepartments] = useState<Department[]>([])

  const form = useForm<FormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      name: "",
      description: "",
      priority: Priority.MEDIUM,
      manHours: 0,
      departmentId: undefined,
    },
  })

  useEffect(() => {
    // Fetch departments when modal opens
    if (isOpen) {
      fetch("/api/departments")
        .then((res) => res.json())
        .then((data) => setDepartments(data))
        .catch((error) => console.error("Failed to fetch departments:", error))
    }
  }, [isOpen])

  useEffect(() => {
    if (task) {
      form.reset({
        name: task.name,
        description: task.description || "",
        priority: task.priority,
        manHours: task.manHours || 0,
        departmentId: task.departmentId || undefined,
      })
    } else {
      form.reset({
        name: "",
        description: "",
        priority: Priority.MEDIUM,
        manHours: 0,
        departmentId: undefined,
      })
    }
  }, [task, form])

  const handleSubmit = async (values: FormData) => {
    try {
      await onSubmit(task?.id, values)
      form.reset()
    } catch (error) {
      console.error("Error submitting task:", error)
    }
  }

  const handleDelete = async () => {
    if (!task?.id || !onDelete) return
    try {
      await onDelete(task.id)
    } catch (error) {
      console.error("Error deleting task:", error)
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

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
                      <SelectItem value={Priority.LOW}>Low</SelectItem>
                      <SelectItem value={Priority.MEDIUM}>Medium</SelectItem>
                      <SelectItem value={Priority.HIGH}>High</SelectItem>
                      <SelectItem value={Priority.URGENT}>Urgent</SelectItem>
                    </SelectContent>
                  </Select>
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
                      min={0}
                      placeholder="Enter estimated hours"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
        </Form>
      </DialogContent>
    </Dialog>
  )
} 