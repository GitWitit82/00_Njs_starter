/**
 * @file projects/[id]/page.tsx
 * @description Project details page component
 */

import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface ProjectPageProps {
  params: {
    id: string;
  };
}

/**
 * Fetches project data with all related information
 */
async function getProject(id: string) {
  const project = await prisma.project.findUnique({
    where: { id },
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
          phase: true,
          tasks: {
            include: {
              assignedTo: true,
              department: true,
            },
          },
        },
        orderBy: {
          order: 'asc',
        },
      },
    },
  });

  if (!project) {
    notFound();
  }

  return project;
}

/**
 * Calculates project progress based on completed tasks
 */
function calculateProgress(phases: any[]): number {
  const totalTasks = phases.reduce(
    (acc, phase) => acc + phase.tasks.length,
    0
  );
  
  if (totalTasks === 0) return 0;

  const completedTasks = phases.reduce(
    (acc, phase) =>
      acc +
      phase.tasks.filter((task: any) => task.status === "COMPLETED").length,
    0
  );

  return Math.round((completedTasks / totalTasks) * 100);
}

/**
 * Gets the status badge variant
 */
function getStatusVariant(status: string) {
  switch (status) {
    case "PLANNING":
      return "secondary";
    case "IN_PROGRESS":
      return "default";
    case "ON_HOLD":
      return "warning";
    case "COMPLETED":
      return "success";
    case "CANCELLED":
      return "destructive";
    default:
      return "secondary";
  }
}

/**
 * Project details page component
 */
export default async function ProjectPage({ params }: ProjectPageProps) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return null;
  }

  const project = await getProject(params.id);
  const progress = calculateProgress(project.phases);

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <Link href="/projects">
          <Button variant="ghost" className="mb-4">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Button>
        </Link>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{project.name}</h1>
            <p className="text-sm text-muted-foreground">{project.description}</p>
            <div className="text-sm text-muted-foreground mt-1">{project.workflow.name}</div>
          </div>

          <div className="text-sm text-right">
            <div className="mb-2">
              <span className="text-muted-foreground">Customer: </span>
              {project.customerName}
            </div>
            {project.vinNumber && (
              <div className="mb-2">
                <span className="text-muted-foreground">VIN: </span>
                {project.vinNumber}
              </div>
            )}
            <div className="mb-2">
              <span className="text-muted-foreground">Manager: </span>
              {project.manager.name}
            </div>
            <div>
              <Badge variant={getStatusVariant(project.status)}>
                {project.status}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="rounded-lg border p-6">
          <h2 className="text-lg font-medium mb-4">Project Progress</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Overall Progress</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>

            <div className="grid grid-cols-4 gap-4 mt-4">
              {project.phases.map((phase: any) => (
                <div key={phase.id} className="space-y-1">
                  <div className="font-medium">{phase.phase.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {phase.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-lg border">
          <Suspense fallback={<div>Loading tasks...</div>}>
            {project.phases.map((phase: any) => (
              <div key={phase.id} className="p-6 border-b last:border-b-0">
                <h3 className="text-lg font-medium mb-4">{phase.phase.name}</h3>
                <div className="space-y-4">
                  {phase.tasks.map((task: any) => (
                    <div key={task.id} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{task.name}</div>
                        {task.assignedTo && (
                          <div className="text-sm text-muted-foreground">
                            Assigned to {task.assignedTo.name}
                          </div>
                        )}
                      </div>
                      <Badge variant={getStatusVariant(task.status)}>
                        {task.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </Suspense>
        </div>
      </div>
    </div>
  );
} 