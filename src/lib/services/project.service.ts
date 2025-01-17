import { Project } from "@prisma/client"
import { prisma } from "@/lib/prisma"

export class ProjectService {
  constructor(private readonly projectId: string) {}

  async getProject() {
    return prisma.project.findUnique({
      where: { id: this.projectId },
      include: {
        tasks: {
          include: {
            assignee: true,
          },
        },
      },
    })
  }

  async updateProject(data: Partial<Project>) {
    return prisma.project.update({
      where: { id: this.projectId },
      data,
      include: {
        tasks: {
          include: {
            assignee: true,
          },
        },
      },
    })
  }

  async deleteProject() {
    return prisma.project.delete({
      where: { id: this.projectId },
    })
  }
} 