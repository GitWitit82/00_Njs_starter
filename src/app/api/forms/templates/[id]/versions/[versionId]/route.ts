import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/db"
import { authOptions } from "@/lib/auth"

const versionSchema = z.object({
  name: z.string().min(1, "Version name is required"),
  description: z.string().optional(),
  schema: z.record(z.unknown()).default({}),
  layout: z.record(z.unknown()).default({}),
  style: z.record(z.unknown()).default({}),
  defaultValues: z.record(z.unknown()).default({}),
  metadata: z.record(z.unknown()).optional().default({}),
  isCurrent: z.boolean().default(false)
})

export async function GET(
  request: Request,
  { params }: { params: { id: string; versionId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const version = await prisma.formTemplateVersion.findUnique({
      where: {
        id: params.versionId,
        templateId: params.id
      },
      include: {
        template: {
          select: {
            id: true,
            name: true,
            description: true,
            completionRequirements: {
              include: {
                dependsOn: true
              }
            }
          }
        }
      }
    })

    if (!version) {
      return NextResponse.json(
        { error: "Form template version not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(version)
  } catch (error) {
    console.error("[FORM_VERSION_GET]", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string; versionId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const validatedBody = versionSchema.partial().parse(await request.json())

    const version = await prisma.formTemplateVersion.findUnique({
      where: {
        id: params.versionId,
        templateId: params.id
      },
      include: {
        template: {
          include: {
            versions: {
              where: {
                isCurrent: true
              }
            }
          }
        }
      }
    })

    if (!version) {
      return NextResponse.json(
        { error: "Form template version not found" },
        { status: 404 }
      )
    }

    // If setting this version as current, check if there are any form instances using the current version
    if (validatedBody.isCurrent && version.template.versions[0]?.id !== version.id) {
      const instanceCount = await prisma.formInstance.count({
        where: {
          templateId: params.id,
          versionId: version.template.versions[0]?.id
        }
      })

      if (instanceCount > 0) {
        return NextResponse.json(
          { error: "Cannot change current version while form instances exist" },
          { status: 400 }
        )
      }

      await prisma.formTemplateVersion.updateMany({
        where: {
          templateId: params.id,
          id: {
            not: params.versionId
          }
        },
        data: {
          isCurrent: false
        }
      })
    }

    const updatedVersion = await prisma.formTemplateVersion.update({
      where: {
        id: params.versionId
      },
      data: {
        name: validatedBody.name,
        description: validatedBody.description,
        schema: validatedBody.schema as Prisma.JsonObject | undefined,
        layout: validatedBody.layout as Prisma.JsonObject | undefined,
        style: validatedBody.style as Prisma.JsonObject | undefined,
        defaultValues: validatedBody.defaultValues as Prisma.JsonObject | undefined,
        metadata: validatedBody.metadata as Prisma.JsonObject,
        isCurrent: validatedBody.isCurrent
      },
      include: {
        template: {
          select: {
            id: true,
            name: true,
            description: true,
            completionRequirements: {
              include: {
                dependsOn: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(updatedVersion)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 422 }
      )
    }
    console.error("[FORM_VERSION_PATCH]", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; versionId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const version = await prisma.formTemplateVersion.findUnique({
      where: {
        id: params.versionId,
        templateId: params.id
      },
      include: {
        template: {
          include: {
            versions: {
              where: {
                isCurrent: true
              }
            }
          }
        }
      }
    })

    if (!version) {
      return NextResponse.json(
        { error: "Form template version not found" },
        { status: 404 }
      )
    }

    // Don't allow deleting the current version
    if (version.isCurrent) {
      return NextResponse.json(
        { error: "Cannot delete the current version" },
        { status: 400 }
      )
    }

    // Check if there are any form instances using this version
    const instanceCount = await prisma.formInstance.count({
      where: {
        templateId: params.id,
        versionId: params.versionId
      }
    })

    if (instanceCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete version with existing form instances" },
        { status: 400 }
      )
    }

    await prisma.formTemplateVersion.delete({
      where: {
        id: params.versionId
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[FORM_VERSION_DELETE]", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
} 