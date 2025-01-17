"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Phase } from "@prisma/client"

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
  const [formData, setFormData] = useState<Partial<Phase>>(
    phase || {
      name: "",
      description: "",
      order: 0,
    }
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await onSubmit(phase?.id, formData)
      onClose()
    } catch {
      // Error handling is done in the parent component
    }
  }

  const handleDelete = async () => {
    if (!phase?.id || !onDelete) return
    try {
      await onDelete(phase.id)
      onClose()
    } catch {
      // Error handling is done in the parent component
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
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                disabled={isLoading}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="order">Order</Label>
              <Input
                id="order"
                type="number"
                value={formData.order}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    order: parseInt(e.target.value, 10),
                  }))
                }
                disabled={isLoading}
                required
              />
            </div>
          </div>
          <DialogFooter>
            {phase && onDelete && (
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
                ? phase
                  ? "Updating..."
                  : "Creating..."
                : phase
                ? "Update"
                : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 