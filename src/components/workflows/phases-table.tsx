/**
 * @file PhasesTable Component
 * @description Displays and manages phases for a workflow
 */

"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Phase } from "@prisma/client"
import { PhaseModal } from "./phase-modal"

interface PhasesTableProps {
  workflowId: string
  phases: Phase[]
}

/**
 * PhasesTable component for displaying and managing workflow phases
 * @param {PhasesTableProps} props - Component props
 * @returns {JSX.Element} Rendered component
 */
export function PhasesTable({ workflowId, phases }: PhasesTableProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPhase, setSelectedPhase] = useState<Phase | null>(null)
  const [showModal, setShowModal] = useState(false)

  const handleCreatePhase = async (data: Partial<Phase>) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/workflows/${workflowId}/phases`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to create phase")
      }

      toast.success("Phase created successfully")
      setShowModal(false)
    } catch {
      toast.error("Failed to create phase")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdatePhase = async (phaseId: string, data: Partial<Phase>) => {
    try {
      setIsLoading(true)
      const response = await fetch(
        `/api/workflows/${workflowId}/phases/${phaseId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      )

      if (!response.ok) {
        throw new Error("Failed to update phase")
      }

      toast.success("Phase updated successfully")
      setShowModal(false)
    } catch {
      toast.error("Failed to update phase")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeletePhase = async (phaseId: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(
        `/api/workflows/${workflowId}/phases/${phaseId}`,
        {
          method: "DELETE",
        }
      )

      if (!response.ok) {
        throw new Error("Failed to delete phase")
      }

      toast.success("Phase deleted successfully")
      setShowModal(false)
    } catch {
      toast.error("Failed to delete phase")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setSelectedPhase(null)
            setShowModal(true)
          }}
        >
          Add Phase
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Order</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {phases.map((phase) => (
              <TableRow key={phase.id}>
                <TableCell>{phase.name}</TableCell>
                <TableCell>{phase.description}</TableCell>
                <TableCell>{phase.order}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setSelectedPhase(phase)
                      setShowModal(true)
                    }}
                  >
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <PhaseModal
        phase={selectedPhase}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={selectedPhase ? handleUpdatePhase : handleCreatePhase}
        onDelete={selectedPhase ? handleDeletePhase : undefined}
        isLoading={isLoading}
      />
    </div>
  )
} 