import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

/**
 * Schema for updating a form version
 */
const updateVersionSchema = z.object({
  isActive: z.boolean().optional(),
  changelog: z.string().optional(),
})

/**
 * GET /api/forms/templates/[id]/versions/[versionId]
 * Get a specific version of a form template
 */
export async function GET(
  req: Request,
  { params }: { params: { id: string; versionId: string } }
) {
  try {
    const session = await getServerSession()
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const version = await prisma.formVersion.findFirst({
      where: {
        id: params.versionId,
        templateId: params.id,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!version) {
      return new NextResponse("Version not found", { status: 404 })
    }

    return NextResponse.json(version)
  } catch (error) {
    console.error("[FORM_VERSION_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

/**
 * PATCH /api/forms/templates/[id]/versions/[versionId]
 * Update a specific version of a form template
 */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string; versionId: string } }
) {
  try {
    const session = await getServerSession()
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const json = await req.json()
    const body = updateVersionSchema.parse(json)

    const version = await prisma.formVersion.findFirst({
      where: {
        id: params.versionId,
        templateId: params.id,
      },
    })

    if (!version) {
      return new NextResponse("Version not found", { status: 404 })
    }

    const updatedVersion = await prisma.formVersion.update({
      where: { id: version.id },
      data: body,
    })

    return NextResponse.json(updatedVersion)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 422 })
    }

    console.error("[FORM_VERSION_PATCH]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

/**
 * POST /api/forms/templates/[id]/versions/[versionId]/restore
 * Restore a form template to a specific version
 */
export async function POST(
  req: Request,
  { params }: { params: { id: string; versionId: string } }
) {
  try {
    const session = await getServerSession()
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const version = await prisma.formVersion.findFirst({
      where: {
        id: params.versionId,
        templateId: params.id,
      },
    })

    if (!version) {
      return new NextResponse("Version not found", { status: 404 })
    }

    // Update the template with the version's data
    const updatedTemplate = await prisma.formTemplate.update({
      where: { id: params.id },
      data: {
        schema: version.schema,
        layout: version.layout,
        style: version.style,
        metadata: version.metadata,
        currentVersion: version.version,
      },
    })

    return NextResponse.json(updatedTemplate)
  } catch (error) {
    console.error("[FORM_VERSION_RESTORE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 