/**
 * @file projects/page.tsx
 * @description Projects listing page with creation functionality
 */

import { Suspense } from "react";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreateProjectDialog } from "@/components/projects/CreateProjectDialog";
import { ProjectsTable } from "@/components/projects/ProjectsTable";

/**
 * Fetches workflows for project creation
 */
async function getWorkflows() {
  return await prisma.workflow.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: "asc",
    },
  });
}

/**
 * Fetches projects with their related data
 */
async function getProjects() {
  return await prisma.project.findMany({
    include: {
      workflow: {
        select: {
          name: true,
        },
      },
      manager: {
        select: {
          name: true,
        },
      },
      phases: {
        include: {
          tasks: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

/**
 * Projects page component
 */
export default async function ProjectsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return null;
  }

  const [workflows, projects] = await Promise.all([
    getWorkflows(),
    getProjects(),
  ]);

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          <p className="text-sm text-muted-foreground">
            Create and manage your projects
          </p>
        </div>
        <CreateProjectDialog workflows={workflows} />
      </div>

      <Suspense fallback={<div>Loading projects...</div>}>
        <ProjectsTable projects={projects} />
      </Suspense>
    </div>
  );
} 