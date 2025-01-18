"use client"

import { useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Workflow } from "@prisma/client"
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
import { toast } from "sonner"

const workflowSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
})

type FormData = z.infer<typeof workflowSchema>

interface WorkflowModalProps {
  workflow?: Workflow | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (workflow: Workflow) => void
}

/**
 * Modal component for creating and editing workflows
 */
export function WorkflowModal({
  workflow,
  open,
  onOpenChange,
  onSuccess,
}: WorkflowModalProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(workflowSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  })

  const isEditing = !!workflow

  useEffect(() => {
    if (workflow) {
      form.reset({
        name: workflow.name,
        description: workflow.description || "",
      })
    } else {
      form.reset({
        name: "",
        description: "",
      })
    }
  }, [workflow, form])

  const onSubmit = async (values: FormData) => {
    try {
      const url = isEditing ? `/api/workflows/${workflow.id}` : "/api/workflows"
      const method = isEditing ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to save workflow")
      }

      onSuccess(data)
      form.reset()
      toast.success(isEditing ? "Workflow updated successfully" : "Workflow created successfully")
    } catch (error) {
      console.error("Error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to save workflow")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Workflow" : "Create Workflow"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Make changes to your workflow here."
              : "Add a new workflow to your system."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter workflow name" {...field} />
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
                      placeholder="Enter workflow description"
                      {...field}
                    />
                  </FormControl>
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
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {isEditing ? "Save Changes" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 