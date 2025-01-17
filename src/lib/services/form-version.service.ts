import { FormVersion } from "@prisma/client"
import { prisma } from "@/lib/prisma"

export class FormVersionService {
  constructor(private readonly formId: string) {}

  async getFormVersion() {
    return prisma.formVersion.findUnique({
      where: { id: this.formId },
      include: {
        createdBy: true,
      },
    })
  }

  async createFormVersion(data: Partial<FormVersion>) {
    return prisma.formVersion.create({
      data: {
        ...data,
        templateId: this.formId,
      },
      include: {
        createdBy: true,
      },
    })
  }

  async compareVersions(versionId1: string, versionId2: string) {
    const [version1, version2] = await Promise.all([
      prisma.formVersion.findUnique({
        where: { id: versionId1 },
      }),
      prisma.formVersion.findUnique({
        where: { id: versionId2 },
      }),
    ])

    if (!version1 || !version2) {
      throw new Error("One or both versions not found")
    }

    const schema1 = version1.schema as Record<string, unknown>
    const schema2 = version2.schema as Record<string, unknown>

    const added = Object.keys(schema2).filter((key) => !(key in schema1))
    const removed = Object.keys(schema1).filter((key) => !(key in schema2))
    const modified = Object.keys(schema1).filter(
      (key) =>
        key in schema2 && JSON.stringify(schema1[key]) !== JSON.stringify(schema2[key])
    )

    return {
      added,
      removed,
      modified,
    }
  }
} 