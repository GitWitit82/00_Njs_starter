"use client"

import { useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Phase } from "@prisma/client"
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

const phaseSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  order: z.number().int().min(0, "Order must be a positive number"),
})

type FormData = z.infer<typeof phaseSchema>

interface PhaseModalProps {
  phase: Phase | null
  isOpen: boolean
  onClose: () => void
  onSubmit: (phaseId: string | undefined, data: Partial<Phase>) => Promise<void>
  onDelete?: (phaseId: string) => Promise<void>
  isLoading?: boolean
}

/**
 * PhaseModal component for creating and editing workflow phases
 * @param {PhaseModalProps} props - Component props
 * @returns {JSX.Element} Rendered component
 */
export function PhaseModal({
  phase,
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  isLoading = false,
}: PhaseModalProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(phaseSchema),
    defaultValues: {
      name: "",
      description: "",
      order: 0,
    },
  })

  useEffect(() => {
    if (phase) {
      form.reset({
        name: phase.name,
        description: phase.description || "",
        order: phase.order,
      })
    } else {
      form.reset({
        name: "",
        description: "",
        order: 0,
      })
    }
  }, [phase, form])

  const handleSubmit = async (values: FormData) => {
    try {
      await onSubmit(phase?.id, values)
      form.reset()
      onClose()
      toast.success(phase ? "Phase updated successfully" : "Phase created successfully")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save phase")
    }
  }

  const handleDelete = async () => {
    if (!phase?.id || !onDelete) return
    try {
      await onDelete(phase.id)
      onClose()
      toast.success("Phase deleted successfully")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete phase")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{phase ? "Edit Phase" : "Create Phase"}</DialogTitle>
          <DialogDescription>
            {phase
              ? "Make changes to the phase here."
              : "Add a new phase to the workflow."}
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
                    <Input placeholder="Enter phase name" {...field} />
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
                      placeholder="Enter phase description"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Order</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      placeholder="Enter phase order"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              {phase && onDelete && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isLoading || form.formState.isSubmitting}
                >
                  Delete
                </Button>
              )}
              <Button 
                type="submit" 
                disabled={isLoading || form.formState.isSubmitting}
              >
                {form.formState.isSubmitting
                  ? phase
                    ? "Updating..."
                    : "Creating..."
                  : phase
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