import { FormResponse } from "@prisma/client"
import { prisma } from "@/lib/prisma"

export class FormResponseService {
  constructor(private readonly formId: string) {}

  async getFormResponse() {
    return prisma.formResponse.findUnique({
      where: { id: this.formId },
      include: {
        instance: true,
        submitter: true,
      },
    })
  }

  async createFormResponse(data: Partial<FormResponse>) {
    return prisma.formResponse.create({
      data: {
        ...data,
        instanceId: this.formId,
      },
      include: {
        instance: true,
        submitter: true,
      },
    })
  }

  async updateFormResponse(data: Partial<FormResponse>) {
    return prisma.formResponse.update({
      where: { id: this.formId },
      data,
      include: {
        instance: true,
        submitter: true,
      },
    })
  }
} 