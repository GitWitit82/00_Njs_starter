/**
 * @file projects/[projectId]/page.tsx
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
import { TasksTable } from "@/components/projects/TasksTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProjectPageProps {
  params: {
    projectId: string;
  };
}

/**
 * Gets the appropriate badge variant based on project status
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
 * Calculates project progress based on completed tasks
 */
function calculateProgress(phases: any[]) {
  let totalTasks = 0;
  let completedTasks = 0;

  phases.forEach((phase) => {
    phase.tasks.forEach((task: any) => {
      totalTasks++;
      if (task.status === "COMPLETED") {
        completedTasks++;
      }
    });
  });

  return totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
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
          order: "asc",
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
 * Project details page component
 */
export default async function ProjectPage({ params }: ProjectPageProps) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return null;
  }

  const project = await getProject(params.projectId);
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
        <Card>
          <CardHeader>
            <CardTitle>Project Progress</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={project.phases[0]?.id}>
              <TabsList className="mb-4">
                {project.phases.map((phase: any) => (
                  <TabsTrigger key={phase.id} value={phase.id}>
                    {phase.phase.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              {project.phases.map((phase: any) => (
                <TabsContent key={phase.id} value={phase.id}>
                  <Suspense fallback={<div>Loading tasks...</div>}>
                    <TasksTable
                      projectId={project.id}
                      tasks={phase.tasks}
                    />
                  </Suspense>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 