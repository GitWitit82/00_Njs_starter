/**
 * @file Workflow Phase Tasks Page Component
 * @description Displays and manages tasks for a specific workflow phase
 */

import { Suspense } from "react"
import { notFound } from "next/navigation"
import { Task } from "@prisma/client"

import { TasksTable } from "@/components/workflows/tasks-table"
import { prisma } from "@/lib/prisma"

interface WorkflowPhaseTasksPageProps {
  params: Promise<{
    workflowId: string
    phaseId: string
  }>
}

async function getPhaseWithTasks(workflowId: string, phaseId: string) {
  const phase = await prisma.phase.findFirst({
    where: {
      id: phaseId,
      workflowId: workflowId,
    },
    include: {
      workflow: true,
      tasks: {
        orderBy: { order: "asc" },
        include: {
          department: true,
        },
      },
    },
  })

  if (!phase) {
    notFound()
  }

  return phase
}

export default async function WorkflowPhaseTasksPage({
  params,
}: WorkflowPhaseTasksPageProps) {
  // Await the params object
  const resolvedParams = await params
  const phase = await getPhaseWithTasks(resolvedParams.workflowId, resolvedParams.phaseId)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {phase.workflow.name} - {phase.name} Tasks
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage tasks and their associated forms for this phase.
        </p>
      </div>

      <Suspense fallback={<div>Loading tasks...</div>}>
        <TasksTable
          workflowId={resolvedParams.workflowId}
          phaseId={phase.id}
          tasks={phase.tasks as Task[]}
        />
      </Suspense>
    </div>
  )
} 