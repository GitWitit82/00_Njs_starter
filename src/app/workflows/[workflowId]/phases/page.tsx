/**
 * @file Workflow Phases Page Component
 * @description Displays and manages phases for a specific workflow
 */

import { Suspense } from "react"
import { notFound } from "next/navigation"
import { Phase } from "@prisma/client"

import { PhasesTable } from "@/components/workflows/phases-table"
import { prisma } from "@/lib/prisma"

interface WorkflowPhasesPageProps {
  params: Promise<{
    workflowId: string
  }>
}

async function getWorkflowWithPhases(workflowId: string) {
  const workflow = await prisma.workflow.findUnique({
    where: { id: workflowId },
    include: {
      phases: {
        orderBy: { order: "asc" },
        include: {
          _count: {
            select: {
              tasks: true,
            },
          },
        },
      },
    },
  })

  if (!workflow) {
    notFound()
  }

  return workflow
}

export default async function WorkflowPhasesPage({
  params,
}: WorkflowPhasesPageProps) {
  // Await the params object
  const resolvedParams = await params
  const workflow = await getWorkflowWithPhases(resolvedParams.workflowId)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {workflow.name} - Phases
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage phases and their associated tasks for this workflow.
        </p>
      </div>

      <Suspense fallback={<div>Loading phases...</div>}>
        <PhasesTable
          workflowId={workflow.id}
          phases={workflow.phases}
        />
      </Suspense>
    </div>
  )
} 