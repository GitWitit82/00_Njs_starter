import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

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

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const paths = request.url.split("/")
    const templateId = paths[paths.indexOf("templates") + 1]
    const versionId = paths[paths.indexOf("versions") + 1]

    const version = await prisma.formTemplateVersion.findUnique({
      where: {
        id: versionId,
        templateId: templateId
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

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const paths = request.url.split("/")
    const templateId = paths[paths.indexOf("templates") + 1]
    const versionId = paths[paths.indexOf("versions") + 1]
    const data = versionSchema.parse(await request.json())

    const version = await prisma.formTemplateVersion.findUnique({
      where: {
        id: versionId,
        templateId: templateId
      }
    })

    if (!version) {
      return NextResponse.json(
        { error: "Form template version not found" },
        { status: 404 }
      )
    }

    const updatedVersion = await prisma.formTemplateVersion.update({
      where: { id: versionId },
      data,
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
        { status: 400 }
      )
    }
    console.error("[FORM_VERSION_PATCH]", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const paths = request.url.split("/")
    const templateId = paths[paths.indexOf("templates") + 1]
    const versionId = paths[paths.indexOf("versions") + 1]

    const version = await prisma.formTemplateVersion.findUnique({
      where: {
        id: versionId,
        templateId: templateId
      }
    })

    if (!version) {
      return NextResponse.json(
        { error: "Form template version not found" },
        { status: 404 }
      )
    }

    await prisma.formTemplateVersion.delete({
      where: { id: versionId }
    })

    return NextResponse.json({ message: "Version deleted successfully" })
  } catch (error) {
    console.error("[FORM_VERSION_DELETE]", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
} 