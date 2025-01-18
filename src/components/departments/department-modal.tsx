"use client"

/**
 * @file DepartmentModal Component
 * @description Modal for creating and editing departments
 */

import { useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Department } from "@prisma/client"
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

const departmentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid color format"),
})

type FormData = z.infer<typeof departmentSchema>

interface DepartmentModalProps {
  department: Department | null
  isOpen: boolean
  onClose: () => void
  onSubmit: (departmentId: string | undefined, data: Partial<Department>) => Promise<void>
  onDelete?: (departmentId: string) => Promise<void>
  isLoading?: boolean
}

/**
 * DepartmentModal component for creating and editing departments
 * @param {DepartmentModalProps} props - Component props
 * @returns {JSX.Element} Rendered component
 */
export function DepartmentModal({
  department,
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  isLoading = false,
}: DepartmentModalProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: "",
      description: "",
      color: "#000000",
    },
  })

  useEffect(() => {
    if (department) {
      form.reset({
        name: department.name,
        description: department.description || "",
        color: department.color,
      })
    } else {
      form.reset({
        name: "",
        description: "",
        color: "#000000",
      })
    }
  }, [department, form])

  const handleSubmit = async (values: FormData) => {
    try {
      await onSubmit(department?.id, values)
      form.reset()
    } catch (error) {
      console.error("Error submitting department:", error)
    }
  }

  const handleDelete = async () => {
    if (!department?.id || !onDelete) return
    try {
      await onDelete(department.id)
    } catch (error) {
      console.error("Error deleting department:", error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {department ? "Edit Department" : "Create Department"}
          </DialogTitle>
          <DialogDescription>
            {department
              ? "Make changes to the department here."
              : "Add a new department to manage tasks."}
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
                    <Input placeholder="Enter department name" {...field} />
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
                      placeholder="Enter department description"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input
                        type="color"
                        className="w-12 h-10 p-1 bg-transparent"
                        {...field}
                      />
                    </FormControl>
                    <Input
                      placeholder="Enter color hex"
                      {...field}
                      className="font-mono"
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              {department && onDelete && (
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
                  ? department
                    ? "Updating..."
                    : "Creating..."
                  : department
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