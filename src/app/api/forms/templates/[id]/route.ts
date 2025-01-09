import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { z } from "zod"

import { authOptions } from "@/lib/auth"

const formTemplateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  departmentId: z.string().optional(),
  phaseId: z.string(),
  schema: z.any(),
  layout: z.any().optional(),
  style: z.any().optional(),
  metadata: z.any().optional(),
  order: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
})

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/forms/templates/[id]
 * Get a specific form template
 */
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession()
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const id = await Promise.resolve(params.id)
    if (!id) {
      return new NextResponse("Template ID is required", { status: 400 })
    }

    const template = await db.formTemplate.findUnique({
      where: { id },
      include: {
        department: true,
        phase: true,
        workflow: true,
        versions: {
          orderBy: {
            version: "desc",
          },
          take: 1,
        },
      },
    })

    if (!template) {
      return new NextResponse("Template not found", { status: 404 })
    }

    return NextResponse.json(template)
  } catch (error) {
    console.error("[FORM_TEMPLATE_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

/**
 * PUT /api/forms/templates/[id]
 * Update a form template
 */
export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const id = await Promise.resolve(params.id)
    if (!id) {
      return new NextResponse("Template ID is required", { status: 400 })
    }

    // Parse request body
    let body
    try {
      body = await req.json()
    } catch (error) {
      return new NextResponse("Invalid request body", { status: 400 })
    }

    // Check if template exists
    const template = await db.formTemplate.findUnique({
      where: { id },
    })

    if (!template) {
      return new NextResponse("Template not found", { status: 404 })
    }

    // Get the current user
    const user = await db.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    // Update the template
    const updatedTemplate = await db.formTemplate.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        departmentId: body.departmentId,
        workflowId: body.workflowId,
        phaseId: body.phaseId,
        schema: body.schema,
        layout: body.layout || {},
        style: body.style || {},
        metadata: body.metadata || {},
        order: body.order || 0,
        isActive: body.isActive,
      },
      include: {
        department: true,
        phase: true,
        workflow: true,
        versions: {
          orderBy: {
            version: "desc",
          },
          take: 1,
        },
      },
    })

    return NextResponse.json(updatedTemplate)
  } catch (error) {
    console.error("[FORM_TEMPLATE_UPDATE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

/**
 * DELETE /api/forms/templates/[id]
 * Delete a form template
 */
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { id } = params

    if (!id) {
      return new NextResponse("Template ID is required", { status: 400 })
    }

    // Check if template exists and belongs to user
    const template = await db.formTemplate.findUnique({
      where: { id },
    })

    if (!template) {
      return new NextResponse("Template not found", { status: 404 })
    }

    // Delete all form instances first
    await db.formInstance.deleteMany({
      where: { templateId: id },
    })

    // Delete the template
    await db.formTemplate.delete({
      where: { id },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[TEMPLATE_DELETE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 