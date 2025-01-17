/**
 * @file Workflow Phases Page Component
 * @description Displays and manages phases for a specific workflow
 */

import { Metadata } from "next"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { PhasesTable } from "@/components/workflows/phases-table"

export const metadata: Metadata = {
  title: "Workflow Phases",
  description: "Manage workflow phases",
}

interface PageProps {
  params: {
    workflowId: string
  }
}

export default async function WorkflowPhasesPage({ params }: PageProps) {
  const workflow = await prisma.workflow.findUnique({
    where: { id: params.workflowId },
    include: {
      phases: {
        orderBy: {
          order: "asc",
        },
      },
    },
  })

  if (!workflow) {
    notFound()
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-8 text-3xl font-bold">
        {workflow.name} - Phases
      </h1>
      <PhasesTable
        workflowId={workflow.id}
        phases={workflow.phases}
      />
    </div>
  )
} 