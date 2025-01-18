/**
 * @file PhasesTable Component
 * @description Displays and manages phases for a workflow
 */

"use client"

import React from "react"
import { useState } from "react"
import { toast } from "sonner"
import { ChevronDown } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Phase, WorkflowTask } from "@prisma/client"
import { PhaseModal } from "./phase-modal"
import { TasksTable } from "./tasks-table"
import { cn } from "@/lib/utils"

interface PhasesTableProps {
  workflowId: string
  phases: (Phase & {
    tasks: WorkflowTask[]
  })[]
}

/**
 * PhasesTable component for displaying and managing workflow phases
 * @param {PhasesTableProps} props - Component props
 * @returns {JSX.Element} Rendered component
 */
export function PhasesTable({ workflowId, phases }: PhasesTableProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPhase, setSelectedPhase] = useState<Phase | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [expandedPhases, setExpandedPhases] = useState<string[]>([])

  const handleCreatePhase = async (_: undefined, data: Partial<Phase>) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/workflows/${workflowId}/phases`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          order: data.order || phases.length,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create phase")
      }

      router.refresh()
      toast.success("Phase created successfully")
      setShowModal(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create phase")
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
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: data.name,
            description: data.description,
            order: data.order,
          }),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update phase")
      }

      router.refresh()
      toast.success("Phase updated successfully")
      setShowModal(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update phase")
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
        const error = await response.json()
        throw new Error(error.error || "Failed to delete phase")
      }

      router.refresh()
      toast.success("Phase deleted successfully")
      setShowModal(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete phase")
    } finally {
      setIsLoading(false)
    }
  }

  const togglePhase = (phaseId: string) => {
    setExpandedPhases(current =>
      current.includes(phaseId)
        ? current.filter(id => id !== phaseId)
        : [...current, phaseId]
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Phases</h2>
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
              <TableHead className="w-[40px]"></TableHead>
              <TableHead className="w-[200px]">Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[80px] text-center">Order</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {phases.map((phase) => (
              <React.Fragment key={phase.id}>
                <TableRow 
                  className={cn(
                    "group cursor-pointer hover:bg-muted/50",
                    expandedPhases.includes(phase.id) && "bg-muted/50"
                  )}
                  onClick={() => togglePhase(phase.id)}
                >
                  <TableCell className="py-2 w-[40px]">
                    <ChevronDown 
                      className={cn(
                        "h-4 w-4 shrink-0 transition-transform duration-200",
                        expandedPhases.includes(phase.id) && "transform rotate-180"
                      )} 
                    />
                  </TableCell>
                  <TableCell className="w-[200px] font-medium">{phase.name}</TableCell>
                  <TableCell>{phase.description}</TableCell>
                  <TableCell className="w-[80px] text-center">{phase.order}</TableCell>
                  <TableCell className="w-[100px] text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedPhase(phase)
                        setShowModal(true)
                      }}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
                {expandedPhases.includes(phase.id) && (
                  <TableRow>
                    <TableCell colSpan={5} className="p-4 bg-muted/30">
                      <TasksTable
                        workflowId={workflowId}
                        phaseId={phase.id}
                        tasks={phase.tasks}
                      />
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
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