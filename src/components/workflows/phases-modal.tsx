"use client"

import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Phase, Workflow } from "@prisma/client"
import { GripVertical, Plus, Trash2, ListTodo } from "lucide-react"
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
import { TasksModal } from "./tasks-modal"

const phaseSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
})

type FormData = z.infer<typeof phaseSchema>

interface PhasesModalProps {
  workflow: Workflow | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (workflow: Workflow) => void
}

type WorkflowWithPhases = Workflow & {
  phases: Phase[]
}

/**
 * Modal component for managing workflow phases
 */
export function PhasesModal({
  workflow,
  open,
  onOpenChange,
  onSuccess,
}: PhasesModalProps) {
  const [phases, setPhases] = useState<Phase[]>([])
  const [selectedPhase, setSelectedPhase] = useState<Phase | null>(null)
  const [isTasksModalOpen, setIsTasksModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<FormData>({
    resolver: zodResolver(phaseSchema),
    defaultValues: {
      name: "",
    },
  })

  // Fetch phases when workflow changes
  useEffect(() => {
    const fetchPhases = async () => {
      if (!workflow) return

      try {
        setIsLoading(true)
        const response = await fetch(`/api/workflows/${workflow.id}`)
        if (!response.ok) throw new Error("Failed to fetch phases")
        
        const data: WorkflowWithPhases = await response.json()
        setPhases(data.phases)
      } catch (error) {
        console.error("Error:", error)
        setError("Failed to load phases")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPhases()
  }, [workflow])

  const onSubmit = async (values: FormData) => {
    if (!workflow) return

    try {
      setIsLoading(true)
      const response = await fetch(`/api/workflows/${workflow.id}/phases`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          order: phases.length,
        }),
      })

      if (!response.ok) throw new Error("Failed to create phase")

      const newPhase = await response.json()
      setPhases((prev) => [...prev, newPhase])
      form.reset()

      // Fetch updated workflow
      const workflowResponse = await fetch(`/api/workflows/${workflow.id}`)
      if (!workflowResponse.ok) throw new Error("Failed to fetch workflow")
      const updatedWorkflow = await workflowResponse.json()
      onSuccess(updatedWorkflow)
    } catch (error) {
      console.error("Error:", error)
      setError("Failed to create phase")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (phaseId: string) => {
    if (!workflow) return
    if (!confirm("Are you sure you want to delete this phase?")) return

    try {
      setIsLoading(true)
      const response = await fetch(
        `/api/workflows/${workflow.id}/phases/${phaseId}`,
        {
          method: "DELETE",
        }
      )

      if (!response.ok) throw new Error("Failed to delete phase")

      setPhases((prev) => prev.filter((phase) => phase.id !== phaseId))

      // Fetch updated workflow
      const workflowResponse = await fetch(`/api/workflows/${workflow.id}`)
      if (!workflowResponse.ok) throw new Error("Failed to fetch workflow")
      const updatedWorkflow = await workflowResponse.json()
      onSuccess(updatedWorkflow)
    } catch (error) {
      console.error("Error:", error)
      setError("Failed to delete phase")
    } finally {
      setIsLoading(false)
    }
  }

  const handleReorder = async (draggedId: string, targetId: string) => {
    if (!workflow) return

    const draggedIndex = phases.findIndex((phase) => phase.id === draggedId)
    const targetIndex = phases.findIndex((phase) => phase.id === targetId)
    
    if (draggedIndex === -1 || targetIndex === -1) return

    const newPhases = [...phases]
    const [draggedPhase] = newPhases.splice(draggedIndex, 1)
    newPhases.splice(targetIndex, 0, draggedPhase)

    // Update order in UI immediately
    setPhases(newPhases)

    try {
      const response = await fetch(`/api/workflows/${workflow.id}/phases/reorder`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phases: newPhases.map((phase, index) => ({
            id: phase.id,
            order: index,
          })),
        }),
      })

      if (!response.ok) throw new Error("Failed to reorder phases")

      // Fetch updated workflow
      const workflowResponse = await fetch(`/api/workflows/${workflow.id}`)
      if (!workflowResponse.ok) throw new Error("Failed to fetch workflow")
      const updatedWorkflow = await workflowResponse.json()
      onSuccess(updatedWorkflow)
    } catch (error) {
      console.error("Error:", error)
      setError("Failed to reorder phases")
      // Revert to original order on error
      setPhases(phases)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{workflow?.name} - Manage Phases</DialogTitle>
            <DialogDescription>
              Add, remove, and reorder phases for this workflow.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/15 p-4 text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Current Phases</h3>
              {phases.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No phases yet. Add your first phase below.
                </p>
              ) : (
                <div className="space-y-2">
                  {phases.map((phase) => (
                    <div
                      key={phase.id}
                      className="flex items-center gap-2 rounded-md border p-2"
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData("text/plain", phase.id)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault()
                        const draggedId = e.dataTransfer.getData("text/plain")
                        handleReorder(draggedId, phase.id)
                      }}
                    >
                      <GripVertical className="h-4 w-4 cursor-move text-muted-foreground" />
                      <span className="flex-1">{phase.name}</span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedPhase(phase)
                            setIsTasksModalOpen(true)
                          }}
                        >
                          <ListTodo className="mr-2 h-4 w-4" />
                          Tasks
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(phase.id)}
                          disabled={isLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete phase</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t pt-4">
              <h3 className="mb-2 text-sm font-medium">Add New Phase</h3>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="flex items-end gap-2"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter phase name"
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isLoading}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Phase
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <TasksModal
        workflow={workflow}
        phase={selectedPhase}
        open={isTasksModalOpen}
        onOpenChange={(open) => {
          setIsTasksModalOpen(open)
          if (!open) setSelectedPhase(null)
        }}
      />
    </>
  )
} 