"use client"

import { useEffect, useState } from "react"
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
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Must be a valid hex color"),
})

type FormData = z.infer<typeof departmentSchema>

interface DepartmentModalProps {
  department?: Department | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (department: Department) => void
}

export function DepartmentModal({
  department,
  open,
  onOpenChange,
  onSuccess,
}: DepartmentModalProps) {
  const [error, setError] = useState<string | null>(null)

  const form = useForm<FormData>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: "",
      description: "",
      color: "#000000",
    },
  })

  const isEditing = !!department

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

  const onSubmit = async (values: FormData) => {
    try {
      const url = isEditing
        ? `/api/departments/${department.id}`
        : "/api/departments"
      const method = isEditing ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to save department")
      }

      const savedDepartment = await response.json()
      onSuccess(savedDepartment)
      form.reset()
    } catch (error) {
      console.error("Error:", error)
      setError(error instanceof Error ? error.message : "Failed to save department")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Department" : "Create Department"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Make changes to your department here."
              : "Add a new department to manage tasks."}
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
                  <div className="flex items-center gap-4">
                    <FormControl>
                      <Input type="color" {...field} />
                    </FormControl>
                    <FormControl>
                      <Input
                        placeholder="Enter hex color"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value.toUpperCase()
                          if (value.startsWith("#") && value.length <= 7) {
                            field.onChange(value)
                          }
                        }}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {isEditing ? "Save Changes" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 