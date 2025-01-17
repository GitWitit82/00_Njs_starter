import { FormInstanceStatus } from "@prisma/client"
import { prisma } from "@/lib/prisma"

export class FormInstanceService {
  constructor(private readonly formId: string) {}

  async getFormInstance() {
    return prisma.formInstance.findUnique({
      where: { id: this.formId },
      include: {
        template: true,
        statusHistory: {
          orderBy: { createdAt: "desc" },
        },
      },
    })
  }

  async updateStatus(status: FormInstanceStatus, userId: string) {
    return prisma.formInstance.update({
      where: { id: this.formId },
      data: {
        status,
        statusHistory: {
          create: {
            status,
            userId,
          },
        },
      },
      include: {
        statusHistory: {
          orderBy: { createdAt: "desc" },
        },
      },
    })
  }
} 