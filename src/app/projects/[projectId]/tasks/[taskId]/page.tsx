import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { TaskDetails } from "@/components/projects/TaskDetails";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Fetches task data including activity and available users
 */
async function getTaskData(projectId: string, taskId: string) {
  const task = await prisma.projectTask.findUnique({
    where: {
      id: taskId,
      projectId: projectId,
    },
    include: {
      assignedTo: true,
      activity: {
        include: {
          user: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      projectPhase: {
        include: {
          project: true,
        },
      },
    },
  });

  if (!task) {
    return null;
  }

  // Get all users that can be assigned to tasks
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return {
    task,
    users,
  };
}

/**
 * Loading skeleton for task details
 */
function TaskDetailsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-4 w-[300px]" />
      </div>
      <div className="flex space-x-2">
        <Skeleton className="h-10 w-[140px]" />
        <Skeleton className="h-10 w-[200px]" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-20 w-full" />
      </div>
    </div>
  );
}

/**
 * Task details page component
 */
export default async function TaskPage({
  params,
}: {
  params: { projectId: string; taskId: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return notFound();
  }

  const data = await getTaskData(params.projectId, params.taskId);
  if (!data) {
    return notFound();
  }

  const { task, users } = data;

  return (
    <div className="container py-6">
      <div className="mb-4">
        <h2 className="text-lg font-medium">
          {task.projectPhase.project.name} / {task.projectPhase.name}
        </h2>
      </div>
      <Suspense fallback={<TaskDetailsSkeleton />}>
        <TaskDetails
          taskId={task.id}
          projectId={params.projectId}
          name={task.name}
          description={task.description}
          status={task.status}
          currentAssignee={task.assignedTo}
          users={users}
          activity={task.activity}
        />
      </Suspense>
    </div>
  );
} 