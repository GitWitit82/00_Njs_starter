import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

// Schema for form field validation
const formFieldSchema = z.object({
  id: z.string(),
  type: z.enum([
    "TEXT",
    "TEXTAREA",
    "NUMBER",
    "CHECKBOX",
    "RADIO",
    "SELECT",
    "DATE",
    "TIME",
    "DATETIME",
    "CUSTOM",
  ]),
  label: z.string(),
  required: z.boolean().default(false),
  defaultValue: z.any().optional(),
  options: z.array(z.any()).optional(),
  validation: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
})

// Schema for form template update
const formTemplateUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  description: z.string().optional(),
  type: z.enum(["CHECKLIST", "FORM", "CUSTOM"]).optional(),
  departmentId: z.string().optional().nullable(),
  phaseId: z.string().optional(),
  schema: z.object({
    fields: z.array(formFieldSchema),
    sections: z.array(z.object({
      id: z.string(),
      title: z.string(),
      description: z.string().optional(),
      fields: z.array(z.string()), // Field IDs
    })).optional(),
    layout: z.record(z.any()).optional(),
  }).optional(),
  layout: z.record(z.any()).optional(),
  style: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
  order: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
})

/**
 * GET /api/forms/templates/[id]
 * Get form template details
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const template = await prisma.formTemplate.findUnique({
      where: { id: params.id },
      include: {
        department: true,
        phase: {
          select: {
            id: true,
            name: true,
            workflow: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        responses: {
          take: 5,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            status: true,
            createdAt: true,
            submittedBy: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
    })

    if (!template) {
      return new NextResponse("Template not found", { status: 404 })
    }

    // Get response statistics
    const stats = await prisma.formResponse.groupBy({
      by: ["status"],
      where: { templateId: params.id },
      _count: true,
    })

    return NextResponse.json({
      ...template,
      _count: {
        responses: stats.reduce((acc, curr) => acc + curr._count, 0),
      },
      stats: stats.reduce((acc, curr) => ({
        ...acc,
        [curr.status.toLowerCase()]: curr._count,
      }), {}),
    })
  } catch (error) {
    console.error("[FORM_TEMPLATE_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

/**
 * PUT /api/forms/templates/[id]
 * Update a form template
 */
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.role || !["ADMIN", "MANAGER"].includes(session.user.role)) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    const template = await prisma.formTemplate.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        phase: {
          select: {
            workflow: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    })

    if (!template) {
      return new NextResponse("Template not found", { status: 404 })
    }

    const json = await request.json()
    const body = formTemplateUpdateSchema.parse(json)

    // If phase is being changed, validate it exists
    if (body.phaseId) {
      const phase = await prisma.phase.findUnique({
        where: { id: body.phaseId },
      })

      if (!phase) {
        return new NextResponse("Phase not found", { status: 404 })
      }
    }

    // If department is specified, validate it exists
    if (body.departmentId) {
      const department = await prisma.department.findUnique({
        where: { id: body.departmentId },
      })

      if (!department) {
        return new NextResponse("Department not found", { status: 404 })
      }
    }

    const updatedTemplate = await prisma.formTemplate.update({
      where: { id: params.id },
      data: {
        ...body,
        schema: body.schema || undefined,
        layout: body.layout || undefined,
        style: body.style || undefined,
        metadata: body.metadata || undefined,
      },
      include: {
        department: true,
        phase: {
          select: {
            id: true,
            name: true,
            workflow: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json(updatedTemplate)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.errors), { status: 422 })
    }

    console.error("[FORM_TEMPLATE_PUT]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

/**
 * DELETE /api/forms/templates/[id]
 * Delete a form template
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.role || !["ADMIN"].includes(session.user.role)) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    const template = await prisma.formTemplate.findUnique({
      where: { id: params.id },
      select: { id: true },
    })

    if (!template) {
      return new NextResponse("Template not found", { status: 404 })
    }

    // Check if template has any responses
    const responseCount = await prisma.formResponse.count({
      where: { templateId: params.id },
    })

    if (responseCount > 0) {
      // If template has responses, just mark it as inactive instead of deleting
      await prisma.formTemplate.update({
        where: { id: params.id },
        data: { isActive: false },
      })
    } else {
      // If no responses, safe to delete
      await prisma.formTemplate.delete({
        where: { id: params.id },
      })
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[FORM_TEMPLATE_DELETE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 