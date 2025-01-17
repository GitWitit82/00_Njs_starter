import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"
import { Prisma } from "@prisma/client"

const createVersionSchema = z.object({
  name: z.string().min(1, "Version name is required"),
  description: z.string().optional(),
  schema: z.record(z.unknown()).default({}),
  layout: z.record(z.unknown()).default({}),
  style: z.record(z.unknown()).default({}),
  defaultValues: z.record(z.unknown()).default({}),
  metadata: z.unknown().optional()
})

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const template = await prisma.formTemplate.findUnique({
      where: { id: params.id },
      select: { id: true }
    })

    if (!template) {
      return NextResponse.json(
        { error: "Form template not found" },
        { status: 404 }
      )
    }

    const versions = await prisma.formTemplateVersion.findMany({
      where: { templateId: params.id },
      include: {
        template: {
          include: {
            completionRequirements: {
              include: {
                dependsOn: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json(versions)
  } catch (error) {
    console.error("[FORM_VERSIONS_GET]", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const validatedBody = createVersionSchema.parse(await request.json())

    const template = await prisma.formTemplate.findUnique({
      where: { id: params.id },
      include: {
        versions: {
          orderBy: {
            createdAt: "desc"
          },
          take: 1
        }
      }
    })

    if (!template) {
      return NextResponse.json(
        { error: "Form template not found" },
        { status: 404 }
      )
    }

    // If this is the first version, set it as current
    const isCurrent = template.versions.length === 0

    // Create new version
    const version = await prisma.formTemplateVersion.create({
      data: {
        name: validatedBody.name,
        description: validatedBody.description,
        schema: validatedBody.schema as Prisma.JsonObject,
        layout: validatedBody.layout as Prisma.JsonObject,
        style: validatedBody.style as Prisma.JsonObject,
        defaultValues: validatedBody.defaultValues as Prisma.JsonObject,
        metadata: validatedBody.metadata as Prisma.JsonObject | null,
        templateId: params.id,
        isCurrent
      },
      include: {
        template: {
          include: {
            completionRequirements: {
              include: {
                dependsOn: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(version)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 422 }
      )
    }
    console.error("[FORM_VERSION_CREATE]", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
} 