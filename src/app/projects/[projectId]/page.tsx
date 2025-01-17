/**
 * @file projects/[projectId]/page.tsx
 * @description Project details page component
 */

import { Metadata } from "next"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { ProjectDetails } from "@/components/projects/ProjectDetails"
import { TasksDataTable } from "@/components/tasks/TasksDataTable"

export const metadata: Metadata = {
  title: "Project Details",
  description: "View and manage project details",
}

interface PageProps {
  params: {
    projectId: string
  }
}

interface Project {
  id: string
  name: string
  description: string | null
  status: string
  createdAt: Date
  updatedAt: Date
  tasks: Task[]
}

interface Task {
  id: string
  name: string
  description: string
  status: string
  priority: string
  createdAt: string
  updatedAt: string
}

export default async function ProjectPage({ params }: PageProps) {
  const project = await prisma.project.findUnique({
    where: { id: params.projectId },
    include: {
      tasks: {
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!project) {
    notFound()
  }

  const handleProjectUpdate = async (data: Partial<Project>) => {
    "use server"
    await prisma.project.update({
      where: { id: params.projectId },
      data,
    })
  }

  const handleTaskUpdate = async (taskId: string, data: Partial<Task>) => {
    "use server"
    await prisma.task.update({
      where: { id: taskId },
      data,
    })
  }

  return (
    <div className="container mx-auto py-10">
      <div className="space-y-8">
        <ProjectDetails
          project={project}
          onUpdate={handleProjectUpdate}
        />
        <TasksDataTable
          tasks={project.tasks}
          onTaskUpdate={handleTaskUpdate}
        />
      </div>
    </div>
  )
} 