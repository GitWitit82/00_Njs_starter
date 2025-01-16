/**
 * @file tasks/page.tsx
 * @description Tasks overview page showing all tasks with sorting and filtering
 */

import { Suspense } from "react";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TasksDataTable } from "@/components/tasks/TasksDataTable";

/**
 * Fetches all tasks with related information
 */
async function getTasks() {
  return await prisma.projectTask.findMany({
    include: {
      project: {
        select: {
          id: true,
          name: true,
        },
      },
      assignedTo: {
        select: {
          id: true,
          name: true,
        },
      },
      department: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

/**
 * Tasks overview page component
 */
export default async function TasksPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return null;
  }

  const tasks = await getTasks();

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Tasks Overview</h1>
        <p className="text-sm text-muted-foreground">
          View and manage all tasks across projects
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Loading tasks...</div>}>
            <TasksDataTable tasks={tasks} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
} 