/**
 * @file PhasesTable Component
 * @description Displays and manages phases for a workflow
 */

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Phase } from "@prisma/client"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PhasesModal } from "./phases-modal"

interface PhaseWithTaskCount extends Phase {
  _count?: {
    tasks: number
  }
}

interface PhasesTableProps {
  workflowId: string
  phases: PhaseWithTaskCount[]
  isLoading?: boolean
}

export function PhasesTable({
  workflowId,
  phases,
  isLoading = false,
}: PhasesTableProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const handlePhaseSuccess = () => {
    setModalOpen(false)
    router.refresh()
  }

  if (isLoading) {
    return <div>Loading phases...</div>
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/15 p-4 text-destructive">
          {error}
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Phase
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Tasks</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {phases.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center">
                No phases found. Create one to get started.
              </TableCell>
            </TableRow>
          ) : (
            phases.map((phase) => (
              <TableRow key={phase.id}>
                <TableCell className="font-medium">{phase.name}</TableCell>
                <TableCell>{phase._count?.tasks || 0} tasks</TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      router.push(`/workflows/${workflowId}/phases/${phase.id}/tasks`)
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Manage Tasks
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <PhasesModal
        workflow={{ 
          id: workflowId,
          name: "",
          description: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSuccess={handlePhaseSuccess}
      />
    </div>
  )
} 