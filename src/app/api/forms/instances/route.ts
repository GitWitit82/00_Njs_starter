import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

/**
 * Schema for creating a form instance
 */
const createInstanceSchema = z.object({
  templateId: z.string(),
  versionId: z.string(),
  projectId: z.string(),
  projectTaskId: z.string(),
})

/**
 * GET /api/forms/instances
 * Get form instances with optional filtering
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession()
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get("projectId")

    const instances = await prisma.formInstance.findMany({
      where: {
        ...(projectId ? { projectId } : {}),
      },
      include: {
        template: {
          select: {
            name: true,
            type: true,
            priority: true,
          },
        },
        version: {
          select: {
            version: true,
            schema: true,
            layout: true,
            style: true,
          },
        },
        responses: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
          select: {
            status: true,
            updatedAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(instances)
  } catch (error) {
    console.error("[FORM_INSTANCES_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

/**
 * POST /api/forms/instances
 * Create a new form instance
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession()
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const json = await req.json()
    const body = createInstanceSchema.parse(json)

    // Verify that the template and version exist
    const template = await prisma.formTemplate.findUnique({
      where: { id: body.templateId },
      include: {
        versions: {
          where: { id: body.versionId },
        },
      },
    })

    if (!template) {
      return new NextResponse("Template not found", { status: 404 })
    }

    if (template.versions.length === 0) {
      return new NextResponse("Version not found", { status: 404 })
    }

    // Create the form instance
    const instance = await prisma.formInstance.create({
      data: {
        templateId: body.templateId,
        versionId: body.versionId,
        projectId: body.projectId,
        projectTaskId: body.projectTaskId,
      },
      include: {
        template: {
          select: {
            name: true,
            type: true,
            priority: true,
          },
        },
        version: {
          select: {
            version: true,
            schema: true,
            layout: true,
            style: true,
          },
        },
      },
    })

    return NextResponse.json(instance)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 422 })
    }

    console.error("[FORM_INSTANCE_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 