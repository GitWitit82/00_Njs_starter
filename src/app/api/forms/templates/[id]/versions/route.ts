import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

/**
 * Schema for creating a new form version
 */
const createVersionSchema = z.object({
  schema: z.any(),
  layout: z.any().optional(),
  style: z.any().optional(),
  metadata: z.any().optional(),
  changelog: z.string().min(1, "Changelog is required"),
})

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/forms/templates/[id]/versions
 * Get all versions of a form template
 */
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession()
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const id = params.id
    if (!id) {
      return new NextResponse("Template ID is required", { status: 400 })
    }

    const versions = await prisma.formVersion.findMany({
      where: {
        templateId: id,
      },
      orderBy: {
        version: "desc",
      },
      include: {
        createdBy: {
          select: {
            name: true,
          },
        },
      },
    })

    return NextResponse.json(versions)
  } catch (error) {
    console.error("[FORM_TEMPLATE_VERSIONS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

/**
 * POST /api/forms/templates/[id]/versions
 * Create a new version of a form template
 */
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const json = await req.json()
    const body = createVersionSchema.parse(json)

    // Get the current user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    // Get the template and its current version
    const template = await prisma.formTemplate.findUnique({
      where: { id: params.id },
      include: {
        versions: {
          orderBy: { version: "desc" },
          take: 1,
        },
      },
    })

    if (!template) {
      return new NextResponse("Template not found", { status: 404 })
    }

    // Create new version
    const newVersion = await prisma.formVersion.create({
      data: {
        version: (template.currentVersion || 0) + 1,
        schema: body.schema,
        layout: body.layout || {},
        style: body.style || {},
        metadata: body.metadata || {},
        changelog: body.changelog,
        templateId: template.id,
        createdById: user.id,
        isActive: true,
      },
    })

    // Update template's current version
    await prisma.formTemplate.update({
      where: { id: template.id },
      data: {
        currentVersion: newVersion.version,
        schema: body.schema,
        layout: body.layout || {},
        style: body.style || {},
        metadata: body.metadata || {},
      },
    })

    return NextResponse.json(newVersion)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 422 })
    }

    console.error("[FORM_VERSION_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 