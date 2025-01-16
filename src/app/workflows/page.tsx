/**
 * @file workflows/page.tsx
 * @description Workflows listing page component
 */

import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { WorkflowsTable } from '@/components/workflows/workflows-table';

/**
 * Fetches workflows data directly from the database
 */
async function getWorkflows() {
  try {
    const workflows = await prisma.workflow.findMany({
      include: {
        phases: {
          include: {
            tasks: true,
          },
        },
        formTemplates: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return workflows;
  } catch (error) {
    console.error('Failed to fetch workflows:', error);
    return [];
  }
}

/**
 * Workflows page component
 */
export default async function WorkflowsPage() {
  const session = await getServerSession();
  
  if (!session) {
    notFound();
  }

  const workflows = await getWorkflows();

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Workflows</h1>
          <p className="text-sm text-muted-foreground">
            Manage workflow templates and their phases
          </p>
        </div>
      </div>

      <Suspense fallback={<div>Loading workflows...</div>}>
        <WorkflowsTable initialData={workflows} />
      </Suspense>
    </div>
  );
} 