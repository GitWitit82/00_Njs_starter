/**
 * @file projects/[projectId]/tasks/[taskId]/page.tsx
 * @description Task details page component
 */

import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TaskDetails } from "@/components/projects/TaskDetails";

interface TaskPageProps {
  params: {
    projectId: string;
    taskId: string;
  };
}

/**
 * Fetches task data with all related information
 */
async function getTask(projectId: string, taskId: string) {
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
    },
  });

  if (!task) {
    notFound();
  }

  return task;
}

/**
 * Fetches all users for task assignment
 */
async function getUsers() {
  return await prisma.user.findMany({
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
 * Task details page component
 */
export default async function TaskPage({ params }: TaskPageProps) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return null;
  }

  const [task, users] = await Promise.all([
    getTask(params.projectId, params.taskId),
    getUsers(),
  ]);

  return (
    <div className="container mx-auto py-10">
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
    </div>
  );
} 